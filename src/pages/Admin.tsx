import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeSlug } from "@/lib/sanitizeSlug";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Copy, Trash2, Image as ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";

const BUCKET = "portal_images";

interface StorageFile {
  name: string;
  publicUrl: string;
}

const Admin = () => {
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const navigate = useNavigate();
  const accessLoading = authLoading || (!!user && roleLoading);

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [slugName, setSlugName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!accessLoading && (!user || role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [accessLoading, user, role, navigate]);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      toast.error("Erro ao listar imagens");
      setLoadingFiles(false);
      return;
    }

    const items: StorageFile[] = (data || [])
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return { name: f.name, publicUrl: urlData.publicUrl };
      });

    setFiles(items);
    setLoadingFiles(false);
  }, []);

  useEffect(() => {
    if (!accessLoading && role === "admin") fetchFiles();
  }, [accessLoading, role, fetchFiles]);

  // File selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSlugName(sanitizeSlug(file.name));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Upload
  const handleUpload = async () => {
    if (!selectedFile || !slugName.trim()) return;
    setUploading(true);

    const finalName = sanitizeSlug(slugName);
    const { error } = await supabase.storage.from(BUCKET).upload(finalName, selectedFile, {
      upsert: true,
      contentType: selectedFile.type,
    });

    if (error) {
      toast.error("Erro no upload: " + error.message);
    } else {
      toast.success("Imagem enviada com sucesso!");
      setSelectedFile(null);
      setSlugName("");
      fetchFiles();
    }
    setUploading(false);
  };

  // Copy link
  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.storage.from(BUCKET).remove([deleteTarget]);
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      toast.success("Imagem removida!");
      fetchFiles();
    }
    setDeleteTarget(null);
  };

  // Loading / auth guard skeleton
  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || role !== "admin") {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Painel Administrativo
            </h1>
          </div>

          {/* Upload Section */}
          <section className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Upload de Imagens</h2>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
              `}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Arraste uma imagem ou clique para selecionar
              </p>
              {selectedFile && (
                <p className="text-foreground text-sm mt-2 font-medium">
                  Selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Slug + Upload button */}
            {selectedFile && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Nome do arquivo (slug)
                  </label>
                  <Input
                    value={slugName}
                    onChange={(e) => setSlugName(e.target.value)}
                    placeholder="nome-do-arquivo.jpg"
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !slugName.trim()}
                  className="self-end gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Fazer Upload
                </Button>
              </div>
            )}
          </section>

          {/* Gallery */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Galeria ({files.length} imagens)
            </h2>

            {loadingFiles ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : files.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhuma imagem no bucket ainda.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="group bg-card border border-border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={file.publicUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2 space-y-2">
                      <p className="text-xs text-foreground truncate font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1 text-xs h-7"
                          onClick={() => handleCopy(file.publicUrl)}
                        >
                          <Copy className="w-3 h-3" />
                          Copiar Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(file.name)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Admin;
