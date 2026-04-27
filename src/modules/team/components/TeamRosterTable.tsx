import { TeamMember } from "../types/team.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TeamRosterTable({ members, onRemove }: { members: TeamMember[], onRemove: (uid: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-lg font-bold text-slate-900">Elenco Atual</h2>
        <Badge variant="outline" className="text-slate-500 font-bold tracking-tight">
          {members.length} INSCRITOS
        </Badge>
      </div>
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Nome</TableHead>
            <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Função</TableHead>
            <TableHead className="font-bold text-slate-500 uppercase text-[10px]">Status</TableHead>
            <TableHead className="text-right font-bold text-slate-500 uppercase text-[10px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.userId} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    {member.userName}
                    {member.role === 'CAPTAIN' && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-tighter">{member.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== 'MANAGER' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover do time?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O jogador <b>{member.userName}</b> perderá acesso às informações privadas da equipe.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemove(member.userId)} className="bg-red-600 hover:bg-red-700">
                            Confirmar Remoção
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-slate-500 font-medium italic">
                Nenhum jogador inscrito no momento.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
