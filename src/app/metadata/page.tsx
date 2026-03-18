import ConverterComponent from "../_components/converter";
import NFTMetadataBuilder from "../_components/nft-metadata-builder";

export default async function Home() {
  return (
    <main id="main-content">
      <h1 className="sr-only">Image Tools</h1>
      <ConverterComponent headingLevel="h2" />
      <NFTMetadataBuilder headingLevel="h2" />
    </main>
  );
}
