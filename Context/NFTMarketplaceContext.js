import React, { useState, useEffect, useContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import { create } from "ipfs-http-client";
import { NFTStorage } from "nft.storage";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const APIKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRmMDJDN2RiZjJEZTgwNkIyZkY2YTA0MjREMDQzNjUxRUNFN0MzNzkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2OTQ0Mzk2OTUwNywibmFtZSI6Ik5GVC1NQVJLRVRQTEFDRSJ9.XuPekGEGcpSehprTkXBej-Vp8-MrpjLblqEM_HYtjaE";

// const projectId = "Your Project Id";
// const projectSecretKey = "Your project secret Key";
// const auth = `Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString(
//   "base64"
// )}`;

// const subdomain = "your sub domain";

// const client = ipfsHttpClient({
//   host: "infura-ipfs.io",
//   port: 5001,
//   protocol: "https",
//   headers: {
//     authorization: auth,
//   },
// });
const client = new NFTStorage({ token: APIKey });

//INTERNAL  IMPORT
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);
    console.log(`This is signer:   ${signer}`);
    console.log(signer);
    console.log(`This is conract:   ${contract}`);
    console.log(contract);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract");
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs";

  //------USESTAT
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const router = useRouter();
  const acc = "";

  //---CHECK IF WALLET IS CONNECTD
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if ((accounts.length > 0) & (accounts[0] != "")) {
        setCurrentAccount(accounts[0]);
        // acc = accounts[0];
      } else {
        setError("No Account Found");
        setOpenError(true);
      }
    } catch (error) {
      setError("Something wrong while connecting to wallet");
      setOpenError(true);
    }
  };

  // useEffect(() => {
  //   checkIfWalletConnected();
  // }, []);

  //---CONNET WALLET FUNCTION
  const connectWallet = async () => {
    try {
      if (!window.ethereum)
        return setOpenError(true), setError("Install MetaMask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      // window.location.reload();
    } catch (error) {
      setError("Error while connecting to wallet");
      setOpenError(true);
    }
  };

  //---UPLOAD TO IPFS FUNCTION
  // const uploadToIPFS = async (file) => {
  //   try {
  //     const added = await client.add({ content: file });
  //     const url = `${subdomain}/ipfs/${added.path}`;
  //     return url;
  //   } catch (error) {
  //     setError("Error Uploading to IPFS");
  //     setOpenError(true);
  //   }
  // };

  const uploadToIPFS = async (file) => {
    try {
      const cid = await client.add(new Blob([file]));
      const url = `https://ipfs.io/ipfs/${cid}`;
      return url;
    } catch (error) {
      setError("Error Uploading to IPFS");
      setOpenError(true);
    }
  };

  //---CREATENFT FUNCTION
  const createNFT = async (name, price, image, description, router) => {
    if (!name || !description || !price || !image)
      return setError("Data Is Missing"), setOpenError(true);

    const data = JSON.stringify({ name, description, image });
    console.log(data);

    try {
      // const added = await client.add(data);

      // const url = `https://infura-ipfs.io/ipfs/${added.path}`;

      const cid = await client.add(new Blob([data]));
      const url = `https://ipfs.io/ipfs/${cid}`;

      console.log("Before Create Sale");
      await createSale(url, price);

      // router.push("/searchPage");
    } catch (error) {
      setError("Error while creating NFT");
      setOpenError(true);
    }
  };

  //--- createSale FUNCTION
  const createSale = async (
    url,
    formInputPrice
    // , isReselling, id
  ) => {
    try {
      console.log(
        url,
        formInputPrice
        // , isReselling, id
      );
      const price = ethers.utils.parseUnits(formInputPrice, "ether");

      console.log("Price set");

      //use of contract
      const contract = await connectingWithSmartContract();

      console.log("Contract Connected");

      const listingPrice = await contract.getListingPrice();

      console.log("Listing Price Done", listingPrice, "  ", price);

      // const transaction = !isReselling
      //   ? await contract.createToken(url, price, {
      //       value: listingPrice.toString(),
      //     })
      //   : await contract.resellToken(id, price, {
      //       value: listingPrice.toString(),
      //     });

      // const transaction = !isReselling
      //   ? await contract.createToken(url, price)
      //   : await contract.resellToken(id, price);

      const transaction = await contract.createToken(url, price, {
        value: listingPrice,
      });
      console.log("Transaction 1");
      await transaction.wait();
      console.log("Transaction 2");
    } catch (error) {
      setError(`error while creating sale: ${error}`);
      setOpenError(true);
    }
  };

  //--FETCHNFTS FUNCTION

  const fetchNFTs = async () => {
    try {
      if (currentAccount) {
        console.log("here 1");
        const provider = new ethers.providers.JsonRpcProvider();
        console.log("here 2");
        const contract = fetchContract(provider);
        console.log("here 3");

        const data = await contract.fetchMarketItems().catch((e) => {
          console.log(e);
        });
        console.log("This is data  ", data);
        console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq : ", data);

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);
              console.log(tokenURI);

              const {
                data: { image, name, description },
              } = await axios.get(tokenURI);
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
              };
            }
          )
        );

        // console.log(items);
        return items;
      }
    } catch (error) {
      setError("Error while fetching NFTS");
      setOpenError(true);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  //--FETCHING MY NFT OR LISTED NFTs
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      if (currentAccount) {
        const contract = await connectingWithSmartContract();

        const data =
          type == "fetchItemsListed"
            ? await contract.fetchItemsListed()
            : await contract.fetchMyNFTs();

        const items = await Promise.all(
          data.map(
            async ({ tokenId, seller, owner, price: unformattedPrice }) => {
              const tokenURI = await contract.tokenURI(tokenId);
              const {
                data: { image, name, description },
              } = await axios.get(tokenURI);
              const price = ethers.utils.formatUnits(
                unformattedPrice.toString(),
                "ether"
              );

              return {
                price,
                tokenId: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
              };
            }
          )
        );
        return items;
      }
    } catch (error) {
      setError("Error while fetching listed NFTs");
      setOpenError(true);
    }
  };

  useEffect(() => {
    fetchMyNFTsOrListedNFTs();
  }, []);

  //---BUY NFTs FUNCTION
  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });

      await transaction.wait();
      router.push("/author");
    } catch (error) {
      setError("Error While buying NFT");
      setOpenError(true);
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        checkIfWalletConnected,
        connectWallet,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        currentAccount,
        titleData,
        setOpenError,
        openError,
        error,
        acc,
        setCurrentAccount,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
