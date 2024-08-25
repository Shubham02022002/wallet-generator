import React, { useState } from "react";
import "./App.css";
import * as bip39 from "bip39";
import bs58 from "bs58";
import Card from "@mui/material/Card";
import { Button, Typography, IconButton } from "@mui/material";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { ethers } from "ethers";
import {
  Keypair,
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { HDKey } from "micro-ed25519-hdkey";

window.Buffer = Buffer;

function App() {
  const [mnemonic, setMnemonic] = useState("");
  const [SOLwallets, setSOLwallets] = useState([]);
  const [ETHwallets, setETHwallets] = useState([]);

  const generateSOLWallet = async () => {
    if (!mnemonic) {
      alert("Please generate or enter a mnemonic first!");
      return;
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic, "SEcRET");
    const hd = HDKey.fromMasterSeed(seed.toString("hex"));
    const walletIndex = SOLwallets.length;
    const path = `m/44'/501'/${walletIndex}'/0'`;

    const derivedKey = hd.derive(path);
    const privateKey = derivedKey.privateKey;
    const keypair = Keypair.fromSeed(privateKey.slice(0, 32));
    const publicKey = keypair.publicKey.toBase58();

    const wallet = {
      publicKey: publicKey,
      privateKey: bs58.encode(keypair.secretKey),
      balance: null,
      showBalance: false,
    };

    setSOLwallets([...SOLwallets, wallet]);
  };

  const generateETHWallet = async () => {
    if (!mnemonic) {
      alert("Please generate or enter a mnemonic first!");
      return;
    }

    const walletIndex = ETHwallets.length;
    const path = `m/44'/60'/${walletIndex}'/0'`;
    const wallet = ethers.Wallet.fromPhrase(mnemonic, path);
    const walletObject = {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
      balance: null,
      showBalance: false,
    };

    setETHwallets([...ETHwallets, walletObject]);
  };

  const checkSOLBalance = async (wallet) => {
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const balance = await connection.getBalance(
        new PublicKey(wallet.publicKey)
      );
      const balanceInSOL = balance / LAMPORTS_PER_SOL;

      setSOLwallets((prevWallets) =>
        prevWallets.map((w) =>
          w.publicKey === wallet.publicKey
            ? { ...w, balance: balanceInSOL, showBalance: true }
            : w
        )
      );
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
    }
  };

  const checkETHBalance = async (wallet) => {
    try {
      const provider = new ethers.InfuraProvider(
        "mainnet",
        import.meta.env.VITE_INFURA_ID
      );
      const balance = await provider.getBalance(wallet.publicKey);
      const balanceInETH = ethers.formatEther(balance);

      setETHwallets((prevWallets) =>
        prevWallets.map((w) =>
          w.publicKey === wallet.publicKey
            ? { ...w, balance: balanceInETH, showBalance: true }
            : w
        )
      );
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const deleteSOLwallet = (publicKey) => {
    setSOLwallets(
      SOLwallets.filter((wallet) => wallet.publicKey !== publicKey)
    );
  };

  const deleteETHwallet = (publicKey) => {
    setETHwallets(
      ETHwallets.filter((wallet) => wallet.publicKey !== publicKey)
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        variant="outlined"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          width: "100%",
          maxWidth: "850px",
          minHeight: "150px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" style={{ marginBottom: "20px" }}>
          SWALT
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setMnemonic(bip39.generateMnemonic());
          }}
          style={{ marginBottom: "20px" }}
        >
          Generate Mnemonic
        </Button>

        {mnemonic && (
          <div
            style={{
              marginBottom: "20px",
              wordWrap: "break-word",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              width: "100%",
              position: "relative",
            }}
          >
            <Typography variant="body1" style={{ fontWeight: "bold" }}>
              Mnemonic:
            </Typography>
            <Typography variant="body2" style={{ color: "#333" }}>
              {mnemonic}
            </Typography>
            <IconButton
              onClick={() => copyToClipboard(mnemonic)}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
              }}
            >
              <FileCopyOutlinedIcon />
            </IconButton>
          </div>
        )}
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            onClick={generateSOLWallet}
            variant="contained"
            color="primary"
            style={{ marginBottom: "20px" }}
          >
            Generate SOL Wallet
          </Button>

          <Button
            onClick={generateETHWallet}
            variant="contained"
            color="primary"
            style={{ marginBottom: "20px" }}
          >
            Generate ETH Wallet
          </Button>
        </div>

        {SOLwallets.map((wallet, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Solana Wallet {index + 1}</Typography>
              <IconButton
                onClick={() => deleteSOLwallet(wallet.publicKey)}
                color="secondary"
              >
                <DeleteIcon />
              </IconButton>
            </div>
            <Typography variant="body2" style={{ marginBottom: "5px" }}>
              Public Key: {wallet.publicKey}
            </Typography>
            <IconButton
              onClick={() => copyToClipboard(wallet.publicKey)}
              style={{ position: "absolute", right: "10px", top: "40px" }}
            >
              <FileCopyOutlinedIcon />
            </IconButton>
            <Typography variant="body2" style={{ marginBottom: "10px" }}>
              Private Key: {wallet.privateKey}
            </Typography>
            <IconButton
              onClick={() => copyToClipboard(wallet.privateKey)}
              style={{ position: "absolute", right: "10px", top: "70px" }}
            >
              <FileCopyOutlinedIcon />
            </IconButton>

            <Button
              onClick={() => checkSOLBalance(wallet)}
              variant="outlined"
              color="primary"
              style={{ marginTop: "10px", width: "100%" }}
            >
              Check Balance
            </Button>

            {wallet.showBalance && (
              <Typography
                variant="body2"
                style={{ fontWeight: "bold", marginTop: "10px" }}
              >
                Balance: {wallet.balance} SOL
              </Typography>
            )}
          </div>
        ))}

        {ETHwallets.map((wallet, index) => (
          <div
            key={index}
            style={{
              width: "100%",
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Ethereum Wallet {index + 1}</Typography>
              <IconButton
                onClick={() => deleteETHwallet(wallet.publicKey)}
                color="secondary"
              >
                <DeleteIcon />
              </IconButton>
            </div>
            <Typography variant="body2" style={{ marginBottom: "5px" }}>
              Public Key: {wallet.publicKey}
            </Typography>
            <IconButton
              onClick={() => copyToClipboard(wallet.publicKey)}
              style={{ position: "absolute", right: "10px", top: "40px" }}
            >
              <FileCopyOutlinedIcon />
            </IconButton>
            <Typography variant="body2" style={{ marginBottom: "10px" }}>
              Private Key: {wallet.privateKey}
            </Typography>
            <IconButton
              onClick={() => copyToClipboard(wallet.privateKey)}
              style={{ position: "absolute", right: "10px", top: "70px" }}
            >
              <FileCopyOutlinedIcon />
            </IconButton>

            <Button
              onClick={() => checkETHBalance(wallet)}
              variant="outlined"
              color="primary"
              style={{ marginTop: "10px", width: "100%" }}
            >
              Check Balance
            </Button>
            {wallet.showBalance && (
              <Typography
                variant="body2"
                style={{ fontWeight: "bold", marginTop: "10px" }}
              >
                Balance: {wallet.balance} ETH
              </Typography>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

export default App;
