import React, { useState } from "react";
import "./App.css";
import * as bip39 from "bip39";
import bs58 from "bs58";
import Card from "@mui/material/Card";
import { Button, Typography, IconButton } from "@mui/material";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const [wallets, setWallets] = useState([]);

  const generateWallet = async () => {
    if (!mnemonic) {
      alert("Please generate or enter a mnemonic first!");
      return;
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic, "SEcRET");
    const hd = HDKey.fromMasterSeed(seed.toString("hex"));
    const walletIndex = wallets.length;
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

    setWallets([...wallets, wallet]);
  };

  const checkBalance = async (wallet) => {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );
    const balance = await connection.getBalance(
      new PublicKey(wallet.publicKey)
    );
    const balanceInSOL = balance / LAMPORTS_PER_SOL;

    setWallets((prevWallets) =>
      prevWallets.map((w) =>
        w.publicKey === wallet.publicKey
          ? { ...w, balance: balanceInSOL, showBalance: true }
          : w
      )
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const deleteWallet = (publicKey) => {
    setWallets(wallets.filter((wallet) => wallet.publicKey !== publicKey));
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
          maxWidth: "800px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" style={{ marginBottom: "20px" }}>
          Solana Wallet Generator
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

        <Button
          onClick={generateWallet}
          variant="contained"
          color="primary"
          style={{ marginBottom: "20px" }}
        >
          Generate Wallet
        </Button>

        {wallets.map((wallet, index) => (
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
              <Typography variant="h6">
                Solana Wallet {index + 1}
              </Typography>
              <IconButton
                onClick={() => deleteWallet(wallet.publicKey)}
                color="secondary"
              >
                <DeleteIcon  />
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
              onClick={() => checkBalance(wallet)}
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
      </Card>
    </div>
  );
}

export default App;
