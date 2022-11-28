import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  Title,
  Filter,
  NFTCard,
  FollowerTab,
  Loader,
} from "../components/componentsindex";
import { getTopCreators } from "../TopCreators/TopCreators";

//IMPORTING CONTRCT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const Home = () => {
  const { checkIfWalletConnected, fetchNFTs, currentAccount, items } =
    useContext(NFTMarketplaceContext);
  useEffect(() => {
    checkIfWalletConnected();
  }, [currentAccount]);

  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);

  useEffect(() => {
    console.log("Current Account  ", currentAccount);
    if (currentAccount) {
      console.log("in here....");
      fetchNFTs().then((items) => {
        setNfts(items.reverse());
        setNftsCopy(items);
      });
    }
  }, [currentAccount]);

  //CREATOR LIST
  const creators = getTopCreators(nfts);
  console.log(creators);

  return (
    <div className={Style.homePage}>
      <HeroSection />
      {creators.length == 0 ? (
        <Loader />
      ) : (
        <FollowerTab TopCreator={creators} />
      )}

      <Title
        heading="Featured NFTs"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <Filter />
      {nfts.length == 0 ? <Loader /> : <NFTCard NFTData={nfts} />}
    </div>
  );
};

export default Home;
