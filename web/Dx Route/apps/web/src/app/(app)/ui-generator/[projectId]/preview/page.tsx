export default async function PreviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <h1>Preview: {projectId}</h1>;
}
