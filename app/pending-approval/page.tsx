import { redirect } from 'next/navigation';
export default function PendingApprovalRedirect() {
  redirect('/aguardando-aprovacao');
}
