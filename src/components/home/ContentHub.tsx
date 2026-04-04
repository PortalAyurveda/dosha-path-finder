import { BookOpen, Utensils, Heart, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SectionTitle from "@/components/SectionTitle";

interface ArticleMock {
  id: string;
  title: string;
  summary: string;
  tag: string;
  type: "article";
}

interface VideoMock {
  id: string;
  title: string;
  youtubeId: string;
  tag: string;
  type: "video";
}

type ContentItem = ArticleMock | VideoMock;

const articles: ArticleMock[] = [
  {
    id: "a1",
    title: "Como equilibrar Pitta no Verão",
    summary: "Alimentos refrescantes e rotinas que acalmam o fogo interno durante os meses mais quentes.",
    tag: "Estilo de Vida",
    type: "article",
  },
  {
    id: "a2",
    title: "Panaceia de Gengibre: receita clássica",
    summary: "Uma receita milenar para fortalecer o Agni e melhorar a digestão de forma natural.",
    tag: "Receitas",
    type: "article",
  },
  {
    id: "a3",
    title: "Rotina matinal para Vata",
    summary: "Práticas de enraizamento e aquecimento para começar o dia com estabilidade e foco.",
    tag: "Estilo de Vida",
    type: "article",
  },
  {
    id: "a4",
    title: "Chá dourado: o leite de cúrcuma",
    summary: "Anti-inflamatório natural que equilibra os três doshas. Aprenda a receita autêntica.",
    tag: "Receitas",
    type: "article",
  },
];

const videos: VideoMock[] = [
  {
    id: "v1",
    title: "O que é Ayurveda? Introdução completa",
    youtubeId: "dQw4w9WgXcQ",
    tag: "Educação",
    type: "video",
  },
  {
    id: "v2",
    title: "Descubra seu Dosha em 5 minutos",
    youtubeId: "dQw4w9WgXcQ",
    tag: "Doshas",
    type: "video",
  },
  {
    id: "v3",
    title: "Receita Ayurvédica: Kitchari nutritivo",
    youtubeId: "dQw4w9WgXcQ",
    tag: "Receitas",
    type: "video",
  },
];

const allContent: ContentItem[] = [...articles, ...videos];

const filterByTab = (tab: string): ContentItem[] => {
  if (tab === "recentes") return allContent;
  if (tab === "receitas") return allContent.filter((item) => item.tag === "Receitas");
  if (tab === "videos") return videos;
  return articles.filter((a) => a.tag === "Estilo de Vida");
};

const ArticleCard = ({ article }: { article: ArticleMock }) => (
  <Card className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all border border-border">
    <div className="h-36 bg-secondary/10 flex items-center justify-center">
      <BookOpen className="h-10 w-10 text-secondary/40" />
    </div>
    <CardContent className="p-5">
      <Badge className="mb-3 text-xs bg-secondary/15 text-secondary border-0">
        {article.tag}
      </Badge>
      <h4 className="text-base mb-2 leading-snug">{article.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
    </CardContent>
  </Card>
);

const VideoCard = ({ video }: { video: VideoMock }) => (
  <Card className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all border border-border">
    <div className="aspect-video w-full">
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}`}
        title={video.title}
        className="w-full h-full rounded-tl-3xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
    <CardContent className="p-5">
      <Badge className="mb-3 text-xs bg-secondary/15 text-secondary border-0">
        {video.tag}
      </Badge>
      <h4 className="text-base leading-snug">{video.title}</h4>
    </CardContent>
  </Card>
);

const ContentCard = ({ item }: { item: ContentItem }) => {
  if (item.type === "video") return <VideoCard video={item} />;
  return <ArticleCard article={item} />;
};

const ContentHub = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <SectionTitle subtitle="Artigos, receitas e práticas para aplicar no seu dia a dia.">
        Explore o Ayurveda na Prática
      </SectionTitle>

      <Tabs defaultValue="recentes" className="w-full">
        <TabsList className="mx-auto mb-8 flex w-fit bg-secondary/10">
          <TabsTrigger value="recentes" className="gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-white">
            <BookOpen className="h-4 w-4" /> Recentes
          </TabsTrigger>
          <TabsTrigger value="receitas" className="gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-white">
            <Utensils className="h-4 w-4" /> Receitas
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-white">
            <Play className="h-4 w-4" /> Vídeos
          </TabsTrigger>
          <TabsTrigger value="estilo" className="gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-white">
            <Heart className="h-4 w-4" /> Estilo de Vida
          </TabsTrigger>
        </TabsList>

        {["recentes", "receitas", "videos", "estilo"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className={`grid gap-6 ${
              tab === "videos"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            }`}>
              {filterByTab(tab).map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default ContentHub;
