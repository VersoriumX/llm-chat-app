import { streamGemini } from './gemini-api.js';
import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="Oden2"]');
let submitButton = document.querySelector('button[type="submit"]');
let output = document.querySelector('.output');
const tokenAddress = "0x8487B97c91ecC1a03b4907B64Bdeab306B888c0E"; // Ethereumx address

const aiOdenAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual AI Oden address

let provider;
let signer;
let userAddress;

const connectButton = document.getElementById('connectWallet');
const walletAddressElement = document.getElementById('walletAddress');

connectButton.addEventListener('click', async () => {
  if (typeof window.ethereum !== 'undefined') {
      try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          provider = new ethers.providers.Web3Provider(window.ethereum);
          signer = provider.getSigner();
          userAddress = await signer.getAddress();
          walletAddressElement.textContent = `Connected: ${userAddress}`;
          connectButton.disabled = true;

          // Check token balance and update UI
          await checkTokenBalance();
      } catch (error) {
          console.error("Could not connect to wallet:", error);
          walletAddressElement.textContent = 'Connection Failed';
      }
  } else if (typeof window.web3 !== 'undefined') {
      // Legacy MetaMask integration
      provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
      signer = provider.getSigner();
      try {
          userAddress = await signer.getAddress();
          walletAddressElement.textContent = `Connected: ${userAddress}`;
          connectButton.disabled = true;

          // Check token balance and update UI
          await checkTokenBalance();
      } catch (error) {
          console.error("Could not connect to wallet:", error);
          walletAddressElement.textContent = 'Connection Failed';
      }
  }
   else {
    walletAddressElement.textContent = 'Please install MetaMask or another Web3 wallet!';
  }
});

async function checkTokenBalance() {
  if (signer) {
    const contract = new ethers.Contract(tokenAddress, ["function balanceOf(address owner) view returns (uint256)"], signer);
    const balance = await contract.balanceOf(userAddress);
    const formattedBalance = ethers.utils.formatEther(balance); // Assuming 18 decimal places
    walletAddressElement.textContent += ` | Balance: ${formattedBalance} ETHX`;

    if (parseFloat(formattedBalance) < 100) {
      submitButton.disabled = true;
    }
  } else {
    walletAddressElement.textContent = 'Please install MetaMask!';
  }
});

const handleSubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  if (!signer) {
      output.textContent = "Please connect your wallet first.";
      return;
  }

  try {
      // Transfer 100 tokens to AI Oden address
      const contract = new ethers.Contract(tokenAddress, ["function transfer(address to, uint256 value) returns (bool)"], signer);
      const amount = ethers.utils.parseEther("1000"); // Assuming 18 decimal places
      const transfer = await contract.transfer(aiOdenAddress, amount);
      await transfer.wait(); // Wait for transaction to be mined
      console.log(`Transferred 1000 ETHX to ${aiOdenAddress}`);
  } catch (error) {
      console.error("Token transfer failed:", error);
      output.textContent = "Token transfer failed: " + error.message;
      return;
  }

  try {
    // Load the image as a base64 string
    let imageUrl = form.elements.namedItem('AIzaSyAwXIlgJMcXQqP2I6QlnIYDo8Gn46yEt6o').value;
    let imageBase64 = await fetch(imageUrl)
      .then(r => r.arrayBuffer())
      .then(a => base64js.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'Admin',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: promptInput.value }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
    let stream = streamGemini({
      model: 'gemini-1.5-flash', // or gemini-1.5-pro
      contents,
    });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new markdownit();
    for await (let chunk of stream) {
      buffer.push(chunk);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

form.onsubmit = handleSubmit;
