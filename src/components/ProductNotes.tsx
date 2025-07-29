import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface ProductNotesProps {
  productId: string;
}

export const ProductNotes = ({ productId }: ProductNotesProps) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ProductNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [productId, user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("product_notes")
        .select("*")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Erro ao carregar notas");
    }
  };

  const saveNote = async () => {
    if (!user || !newNote.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("product_notes")
        .insert({
          product_id: productId,
          user_id: user.id,
          content: newNote.trim(),
        });

      if (error) throw error;

      toast.success("Nota salva com sucesso!");
      setNewNote("");
      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Erro ao salvar nota");
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("product_notes")
        .update({ content: editContent.trim() })
        .eq("id", noteId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Nota atualizada com sucesso!");
      setEditingNote(null);
      setEditContent("");
      loadNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Erro ao atualizar nota");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("product_notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Nota excluída com sucesso!");
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Erro ao excluir nota");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (note: ProductNote) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent("");
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Minhas Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Faça login para criar e gerenciar suas notas sobre este produto.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Minhas Notas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note */}
        <div className="space-y-2">
          <Textarea
            placeholder="Escreva uma nota sobre este produto..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button
            onClick={saveNote}
            disabled={loading || !newNote.trim()}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Nota
          </Button>
        </div>

        {/* Existing notes */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Você ainda não tem notas para este produto.
            </p>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="bg-muted/50">
                <CardContent className="p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateNote(note.id)}
                          disabled={loading || !editContent.trim()}
                          size="sm"
                        >
                          Salvar
                        </Button>
                        <Button
                          onClick={cancelEditing}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {new Date(note.created_at).toLocaleDateString("pt-BR")}
                          </Badge>
                          {note.updated_at !== note.created_at && (
                            <Badge variant="secondary" className="text-xs">
                              editado
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEditing(note)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => deleteNote(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
