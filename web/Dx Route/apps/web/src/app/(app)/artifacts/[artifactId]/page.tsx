export default async function ArtifactPage({
  params,
}: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await params;
  return <h1>Artifact: {artifactId}</h1>;
}
