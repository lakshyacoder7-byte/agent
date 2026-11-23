import KnowledgeSurface from "../../../views/KnowledgeSurface.jsx";

export default function NewsPage() {
  return <KnowledgeSurface title="News Explorer" eyebrow="CURRENT & HISTORICAL" description="News and historical resources will appear only when authorized news providers are connected." icon="◆" providerName="News provider" connected={false} />;
}
