import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "../src/lib/firebase/admin";

enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZER = "ORGANIZER",
  REFEREE = "REFEREE",
  STAFF = "STAFF",
  TEAM_MANAGER = "TEAM_MANAGER",
  ATHLETE = "ATHLETE",
  PUBLIC_USER = "PUBLIC_USER",
}

enum UserStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
  REJECTED = "REJECTED",
  DEACTIVATED = "DEACTIVATED",
}

type BootstrapOptions = {
  email: string;
  fullName: string;
  password?: string;
  force?: boolean;
};

function parseArgs(argv: string[]): BootstrapOptions {
  const args = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args.set(key, true);
    } else {
      args.set(key, next);
      i++;
    }
  }

  const email = String(args.get("email") ?? "").trim();
  const fullName = String(args.get("fullName") ?? "").trim();
  const password = String(args.get("password") ?? "").trim() || undefined;
  const force = Boolean(args.get("force"));

  if (!email) {
    throw new Error("Missing --email");
  }

  if (!fullName) {
    throw new Error("Missing --fullName");
  }

  return { email, fullName, password, force };
}

async function findOrCreateUser(input: BootstrapOptions) {
  try {
    const existingUser = await adminAuth.getUserByEmail(input.email);
    return { user: existingUser, created: false };
  } catch (error: any) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }
  }

  if (!input.password) {
    throw new Error(
      "User does not exist. Provide --password to create the first SUPER_ADMIN."
    );
  }

  const createdUser = await adminAuth.createUser({
    email: input.email,
    password: input.password,
    displayName: input.fullName,
    emailVerified: true,
    disabled: false,
  });

  return { user: createdUser, created: true };
}

async function upsertUserProfile(params: {
  uid: string;
  email: string;
  fullName: string;
  created: boolean;
}) {
  const { uid, email, fullName, created } = params;
  const now = FieldValue.serverTimestamp();

  const ref = adminDb.collection("usuarios").doc(uid);
  const snap = await ref.get();

  const patch = {
    uid,
    email,
    fullName,
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isApproved: true,
    approvalRequired: false,
    requestedRole: UserRole.SUPER_ADMIN,
    phone: null,
    teamId: null,
    photoUrl: null,
    blockedReason: null,
    suspensionReason: null,
    metadata: {
      bootstrap: true,
      source: "bootstrap-super-admin-script",
    },
    preferences: {},
    updatedAt: now,
    lastRoleChangeAt: now,
    lastRoleChangeBy: "bootstrap-script",
    lastApprovalAt: now,
    lastApprovalBy: "bootstrap-script",
    accessVersion: 1,
  };

  if (!snap.exists) {
    await ref.set({
      ...patch,
      createdAt: now,
      createdBy: "bootstrap-script",
    });
    return;
  }

  await ref.set(patch, { merge: true });

  if (created) {
    await ref.set(
      {
        createdAt: now,
        createdBy: "bootstrap-script",
      },
      { merge: true }
    );
  }
}

async function setClaims(uid: string) {
  await adminAuth.setCustomUserClaims(uid, {
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
    isApproved: true,
    approvalRequired: false,
  });
}

async function guardAgainstDuplicateSuperAdmin(email: string, force?: boolean) {
  const snapshot = await adminDb
    .collection("usuarios")
    .where("role", "==", UserRole.SUPER_ADMIN)
    .limit(5)
    .get();

  if (!snapshot.empty && !force) {
    const existing = snapshot.docs.map((doc: any) => {
      const data = doc.data() as { email?: string; fullName?: string };
      return { uid: doc.id, email: data.email ?? "", fullName: data.fullName ?? "" };
    });

    throw new Error(
      [
        "A SUPER_ADMIN already exists.",
        "Use --force if you intentionally want to create/promote another one.",
        `Existing SUPER_ADMIN(s): ${JSON.stringify(existing, null, 2)}`,
        `Requested email: ${email}`,
      ].join("\n")
    );
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  await guardAgainstDuplicateSuperAdmin(options.email, options.force);

  const { user, created } = await findOrCreateUser(options);

  await setClaims(user.uid);

  await upsertUserProfile({
    uid: user.uid,
    email: options.email,
    fullName: options.fullName,
    created,
  });

  await adminAuth.updateUser(user.uid, {
    displayName: options.fullName,
    disabled: false,
  });

  await adminAuth.revokeRefreshTokens(user.uid);

  const refreshedUser = await adminAuth.getUser(user.uid);

  console.log("✅ SUPER_ADMIN bootstrap completed");
  console.log({
    uid: refreshedUser.uid,
    email: refreshedUser.email,
    displayName: refreshedUser.displayName,
    created,
    customClaims: refreshedUser.customClaims,
  });

  console.log(
    "ℹ️ If this user was already logged in, sign in again to get fresh claims/session."
  );
}

main().catch((error) => {
  console.error("❌ Failed to bootstrap SUPER_ADMIN");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
