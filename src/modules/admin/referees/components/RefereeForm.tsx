'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RefereeRole } from '../types';
import { Loader2, Save, X } from 'lucide-react';

interface RefereeFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function RefereeForm({ onClose, onSubmit }: RefereeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'MAIN' as RefereeRole,
    phone: '',
    city: 'Araçoiaba',
    state: 'PE',
    cpf: '',
    pix: '',
    matchFee: '',
    notes: '',
    status: 'ACTIVE' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking delay
    setTimeout(() => {
      onSubmit(formData);
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nome Completo</Label>
          <Input
            required
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
            className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12 focus:ring-blue-600"
            placeholder="Ex: Carlos Henrique da Silva"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Função</Label>
          <Select
            value={formData.role}
            onValueChange={(v: RefereeRole) => setFormData({...formData, role: v})}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="MAIN">Juiz Principal</SelectItem>
              <SelectItem value="ASSISTANT">Bandeirinha</SelectItem>
              <SelectItem value="FOURTH">Quarto Árbitro</SelectItem>
              <SelectItem value="SCORER">Mesário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Telefone / WhatsApp</Label>
          <Input
            required
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
            placeholder="(81) 90000-0000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cidade</Label>
            <Input
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Estado</Label>
            <Input
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
              disabled
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">CPF (Opcional)</Label>
          <Input
            value={formData.cpf}
            onChange={e => setFormData({...formData, cpf: e.target.value})}
            className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Chave PIX (Opcional)</Label>
          <Input
            value={formData.pix}
            onChange={e => setFormData({...formData, pix: e.target.value})}
            className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Valor por Jogo (R$)</Label>
          <Input
            type="number"
            value={formData.matchFee}
            onChange={e => setFormData({...formData, matchFee: e.target.value})}
            className="bg-zinc-950 border-zinc-800 text-white rounded-xl h-12"
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800 self-end h-12">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status Ativo</span>
          <Switch
            checked={formData.status === 'ACTIVE'}
            onCheckedChange={v => setFormData({...formData, status: v ? 'ACTIVE' : 'INACTIVE'})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Observações</Label>
        <Textarea
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
          className="bg-zinc-950 border-zinc-800 text-white rounded-xl min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-zinc-500 hover:text-white font-bold uppercase text-[10px] tracking-widest"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[10px] tracking-widest px-8 rounded-xl h-12 shadow-lg shadow-blue-900/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Árbitro
        </Button>
      </div>
    </form>
  );
}
