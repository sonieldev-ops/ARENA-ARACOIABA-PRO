import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UserPlus, Mail, Loader2 } from "lucide-react";

export function TeamInvitePlayerDialog({ onInvite }: { onInvite: (email: string, role: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    await onInvite(email, role);
    setLoading(false);
    setOpen(false);
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-blue-200 shadow-lg">
          <UserPlus className="h-4 w-4" /> CONVIDAR JOGADOR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Novo Recrutamento</DialogTitle>
          <DialogDescription>
            Envie um convite para o e-mail do atleta. Ele precisará aceitar para entrar no elenco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-slate-700">E-mail do Atleta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                placeholder="atleta@exemplo.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="font-bold text-slate-700">Função no Time</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLAYER">Jogador</SelectItem>
                <SelectItem value="CAPTAIN">Capitão</SelectItem>
                <SelectItem value="STAFF">Comissão Técnica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 font-bold"
            onClick={handleSubmit}
            disabled={loading || !email}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            ENVIAR CONVITE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
