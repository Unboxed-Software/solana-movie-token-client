import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  initializeKeypair,
  airdropIfRequired,
  getExplorerLink,
} from "@solana-developers/helpers";

const PROGRAM_ID = new PublicKey(
  "AzKatnACpNwQxWRs2YyPovsGhgsYVBiTmC3TL4t72eJW",
);

const LOCALHOST_RPC_URL = "http://localhost:8899";
const AIRDROP_AMOUNT = 2 * LAMPORTS_PER_SOL;
const MINIMUM_BALANCE_FOR_RENT_EXEMPTION = 1 * LAMPORTS_PER_SOL;

const connection = new Connection(LOCALHOST_RPC_URL);
const userKeypair = await initializeKeypair(connection);

await airdropIfRequired(
  connection,
  userKeypair.publicKey,
  AIRDROP_AMOUNT,
  MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
);

const [tokenMintPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_mint")],
  PROGRAM_ID,
);

const [tokenAuthPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_auth")],
  PROGRAM_ID,
);

const INITIALIZE_MINT_INSTRUCTION = 3;

const initializeMintInstruction = new TransactionInstruction({
  keys: [
    { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
    { pubkey: tokenMintPDA, isSigner: false, isWritable: true },
    { pubkey: tokenAuthPDA, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ],
  programId: PROGRAM_ID,
  data: Buffer.from([INITIALIZE_MINT_INSTRUCTION]),
});

const transaction = new Transaction().add(initializeMintInstruction);

try {
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [userKeypair],
  );
  const explorerLink = getExplorerLink("transaction", transactionSignature);

  console.log(`Transaction submitted: ${explorerLink}`);
} catch (error) {
  if (error instanceof Error) {
    throw new Error(
      `Failed to initialize program token mint: ${error.message}`,
    );
  } else {
    throw new Error("An unknown error occurred");
  }
}
