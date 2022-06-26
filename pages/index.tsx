import detectEthereumProvider from "@metamask/detect-provider"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { providers,Contract,utils,getDefaultProvider } from "ethers"
import Head from "next/head"
import React from "react"
import styles from "../styles/Home.module.css"
import {abi as targetABI}  from "./target.sol/Target.json"
import {abi as sourceABI} from "./source.sol/Source.json"

export default function Home() {
    const [logs, setLogs] = React.useState("Connect your wallet and greet!")
    const [identity, setIdentity] = React.useState(0n);
    async function createProof() {
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //onst sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        const TargetContract=new Contract('0xC57D4a08d3225792F02Bb0CD9Db6e4E02Ff9FA32',targetABI,signer)
        //0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813
        //const SourceContract=new Contract('0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813',sourceABI,signer)
        const message = await signer.signMessage("Mix your token here!")

        const identity = new Identity(message)
        const idCommit=identity.generateCommitment()
        setIdentity(idCommit)
        let nullifierHash;
        
        setLogs(`Creating your Semaphore proof... for ID ${idCommit}`)

       
        console.log(Object.keys(identity))
        let group= new Group(20)
        let commits=await TargetContract.getTreeInfo(2)
        console.log(commits[0])
        let members= commits[0].map(x=>x.toString())
        console.log(members)
        group.addMembers(members)
        console.log(group.root)
        try{
            const greeting = "Hello world"
            const { proof, publicSignals } = await generateProof(identity, group, group.root, greeting, {
                wasmFilePath: "./semaphore.wasm",
                zkeyFilePath: "./semaphore.zkey"
            })
            const solidityProof = packToSolidityProof(proof)
          
            
            console.log(publicSignals)
            nullifierHash=publicSignals.nullifierHash
     
           
            console.log(nullifierHash)
            console.log(solidityProof)
           let r= await TargetContract.verifyTest(utils.formatBytes32String(greeting),nullifierHash,solidityProof,2,{gasLimit:4000000})

           console.log(r)
        }catch(e){
            console.log(e)
        }     

      
    }
    async function addID(){
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //const sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        const TargetContract=new Contract('0xC57D4a08d3225792F02Bb0CD9Db6e4E02Ff9FA32',targetABI,signer)
        //0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813
        //const SourceContract=new Contract('0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813',sourceABI,signer)
        const message = await signer.signMessage("Mix your token here!")

        const identity = new Identity(message)
        const idCommit=identity.generateCommitment()
        setIdentity(idCommit)
        let r=await TargetContract.addTestCommitment(2,idCommit)
        console.log(await r.wait())
    }
    
    return (
        <div className={styles.container}>
            <Head>
                <title>Greetings</title>
                <meta name="description" content="A simple Next.js/Hardhat privacy application with Semaphore." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Greetings</h1>

                

                <div className={styles.logs}>{logs}</div>

                <div onClick={() => addID()} className={styles.button}>
                    register Identity
                </div>
                <div onClick={() => createProof()} className={styles.button}>
                    make ZK Proof
                </div>
            </main>
        </div>
    )
}
