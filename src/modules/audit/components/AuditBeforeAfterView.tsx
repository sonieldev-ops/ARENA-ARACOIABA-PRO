import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuditBeforeAfterViewProps {
  before: any;
  after: any;
}

export function AuditBeforeAfterView({ before, after }: AuditBeforeAfterViewProps) {
  // Função para encontrar chaves que mudaram
  const getChangedKeys = () => {
    if (!before || !after) return [];
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    return Array.from(keys).filter(key =>
      JSON.stringify(before[key]) !== JSON.stringify(after[key])
    );
  };

  const changedKeys = getChangedKeys();

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-muted-foreground italic">null</span>;
    if (typeof val === 'boolean') return <Badge variant="outline">{val ? 'TRUE' : 'FALSE'}</Badge>;
    if (typeof val === 'object') return <pre className="text-[10px]">{JSON.stringify(val, null, 2)}</pre>;
    return String(val);
  };

  return (
    <div className="space-y-4">
      {changedKeys.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-2 text-left font-medium w-1/3">Campo</th>
                <th className="p-2 text-left font-medium w-1/3 text-red-600">Antes</th>
                <th className="p-2 text-left font-medium w-1/3 text-green-600">Depois</th>
              </tr>
            </thead>
            <tbody>
              {changedKeys.map(key => (
                <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs">{key}</td>
                  <td className="p-2 text-xs bg-red-50/30">{renderValue(before[key])}</td>
                  <td className="p-2 text-xs bg-green-50/30">{renderValue(after[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-md bg-muted/20 text-muted-foreground text-sm">
          Nenhuma alteração direta de campos detectada ou dados ausentes.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-muted-foreground">Snapshot Completo Antes</h4>
          <ScrollArea className="h-[200px] rounded-md border p-2 bg-slate-950 text-slate-50">
            <pre className="text-[10px]">{JSON.stringify(before, null, 2)}</pre>
          </ScrollArea>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-muted-foreground">Snapshot Completo Depois</h4>
          <ScrollArea className="h-[200px] rounded-md border p-2 bg-slate-950 text-slate-50">
            <pre className="text-[10px]">{JSON.stringify(after, null, 2)}</pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
