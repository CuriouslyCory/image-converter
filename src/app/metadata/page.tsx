import ConverterComponent from "../_components/converter";
import NFTMetadataBuilder from "../_components/nft-metadata-builder";

export default async function Home() {
  return (
    <main>
      <ConverterComponent />
      <NFTMetadataBuilder />
    </main>
  );
}
