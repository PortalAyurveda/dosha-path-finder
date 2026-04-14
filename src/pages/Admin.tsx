import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeSlug } from "@/lib/sanitizeSlug";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { Upload, Copy, Trash2, Image as ImageIcon, Loader2, ShieldCheck, X } from "lucide-react";
import { Helmet } from "react-helmet-async";

const BUCKET = "portal_images";

interface StorageFile {
  name: string;
  publicUrl: string;
}

interface PendingFile {
  file: File;
  slugName: string;
}

const Admin = () => {
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const navigate = useNavigate();
  const accessLoading = authLoading || (!!user && roleLoading);

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Multi-upload state
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
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

  // Add files to pending list
  const addFiles = (fileList: FileList | File[]) => {
    const newFiles: PendingFile[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, slugName: sanitizeSlug(f.name) }));

    if (newFiles.length === 0) {
      toast.error("Nenhuma imagem válida selecionada");
      return;
    }

    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const updateSlug = (index: number, newSlug: string) => {
    setPendingFiles((prev) =>
      prev.map((p, i) => (i === index ? { ...p, slugName: newSlug } : p))
    );
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload all pending files
  const handleUploadAll = async () => {
    const valid = pendingFiles.filter((p) => p.slugName.trim());
    if (valid.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < valid.length; i++) {
      const { file, slugName } = valid[i];
      const finalName = sanitizeSlug(slugName);

      const { error } = await supabase.storage.from(BUCKET).upload(finalName, file, {
        upsert: true,
        contentType: file.type,
      });

      if (error) {
        toast.error(`Erro: ${finalName} — ${error.message}`);
        errorCount++;
      } else {
        successCount++;
      }

      setUploadProgress(Math.round(((i + 1) / valid.length) * 100));
    }

    if (successCount > 0) {
      toast.success(`${successCount} imagem(ns) enviada(s) com sucesso!`);
      fetchFiles();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} arquivo(s) falharam no upload.`);
    }

    setPendingFiles([]);
    setUploading(false);
    setUploadProgress(0);
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

  if (!user || role !== "admin") return null;

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
                multiple
                className="hidden"
                onChange={handleInputChange}
              />
              <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Arraste imagens ou clique para selecionar (múltiplos arquivos)
              </p>
            </div>

            {/* Pending files list */}
            {pendingFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {pendingFiles.length} arquivo(s) selecionado(s)
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingFiles.map((pf, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                      <img
                        src={URL.createObjectURL(pf.file)}
                        alt={pf.file.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <Input
                        value={pf.slugName}
                        onChange={(e) => updateSlug(index, e.target.value)}
                        className="flex-1 h-8 text-xs"
                        placeholder="nome-do-arquivo.jpg"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removePending(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {uploading && (
                  <Progress value={uploadProgress} className="h-2" />
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadAll}
                    disabled={uploading || pendingFiles.every((p) => !p.slugName.trim())}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Enviar {pendingFiles.length} arquivo(s)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPendingFiles([])}
                    disabled={uploading}
                  >
                    Limpar
                  </Button>
                </div>
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
