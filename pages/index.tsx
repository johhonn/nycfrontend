import detectEthereumProvider from "@metamask/detect-provider"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { providers,Contract,utils } from "ethers"
import Head from "next/head"
import React from "react"
import styles from "../styles/Home.module.css"
import {abi as targetABI}  from "./target.sol/Target.json"
import {abi as sourceABI} from "./source.sol/Source.json"
let provider;
let ethersProvider;
let sourceContract;
let TargetContract;
export default function Home() {
    const [logs, setLogs] = React.useState("Connect your wallet and deposit from your chain of choice!")
    const [identity, setIdentity] = React.useState(0n);
    React.useEffect(() => {
        // declare the data fetching function
       
      
        // call the function
        async function getProvider(){
           provider = (await detectEthereumProvider()) as any
           ethersProvider = new providers.Web3Provider(provider)
          console.log(Object.keys(provider))
          return r;
        }
        getProvider()
          // make sure to catch any error
          .catch(console.error);
      }, [])
    async function createProof() {
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //onst sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        const TargetContract=new Contract('0x5076Aa4E6072494907359Ba59B82aFb9A6CE4B3F',targetABI,signer)
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
            /**await TargetContract.withdraw( utils.formatBytes32String(greeting,
        nullifierHash,
        solidityProof,
        1,
        signer.address,
        destinationDomain,
        asset)
        **/
           console.log(r)
        }catch(e){
            console.log(e)
        }     

      
    }
    async function addID(){
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any
        console.log(provider)
        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //const sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        const TargetContract=new Contract('0x1047016adcfEA4E0Fd6cA5c05F126119E0ac95eD'
         ,targetABI,signer)
        //0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813
        //const SourceContract=new Contract('0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813',sourceABI,signer)
        const message = await signer.signMessage("Mix your token here!")

        const identity = new Identity(message)
        const idCommit=identity.generateCommitment()
        setIdentity(idCommit)
        let r=await TargetContract.addTestCommitment(2,idCommit)
        console.log(await r.wait())
    }
    async function addCommit(){
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any
        console.log(provider)
        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //const sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        const TargetContract=new Contract('0x1047016adcfEA4E0Fd6cA5c05F126119E0ac95eDF',targetABI,signer)
        //0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813
        //const SourceContract=new Contract('0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813',sourceABI,signer)
        const message = await signer.signMessage("Mix your token here!")

        const identity = new Identity(message)
        const idCommit=identity.generateCommitment()
        setIdentity(idCommit)
        let r=await TargetContract.addCommitment(idCommit)
        console.log(await r.wait())
    }
    async function addCrossChainID(){
        setLogs("Creating your Semaphore identity...")

        const provider = (await detectEthereumProvider()) as any

        await provider.request({ method: "eth_requestAccounts" })

        const ethersProvider = new providers.Web3Provider(provider)
        //const sourceProvider = getDefaultProvider("goerli")
        const signer = ethersProvider.getSigner()
        //const SourceContract=new Contract('0xC57D4a08d3225792F02Bb0CD9Db6e4E02Ff9FA32',targetABI,signer)
        //0xB17Be17999ED91C8829554CBb1C1CcB1c8CD813
        //0xF4B9bfB371BbFA0d1D2c56f712f766652BCd1859
        const SourceContract=new Contract('0xDEC7B7dbbF626B043B0C266364a1ba3368a0E74c',sourceABI,signer)
        const message = await signer.signMessage("Mix your token here!")

        const identity = new Identity(message)
        const idCommit=identity.generateCommitment()
        setIdentity(idCommit)
        setLogs(`Sending your ZK ID cross chain ${idCommit}`)
        const originDomain=3331//goerli
        const destinationDomain=1111//rinkey
        console.log('sending this thing')
        let r=await SourceContract.addCommitment(
            '0x9e77475373e39cbFFf828fd6A691AcB492769C8b',
            '0x3FFc03F05D1869f493c7dbf913E636C6280e0ff9',            
            originDomain,
            destinationDomain,
            idCommit
        )
        console.log(await r.wait())
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>GM</title>
                <meta name="description" content="A simple Next.js/Hardhat privacy application with Semaphore and Connext.Transfer" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>GM</h1>

                

                <div className={styles.logs}>{logs}</div>

                <div onClick={() => addCommit()} className={styles.button}>
                     deposit to pool
                </div>
                <div onClick={() => createProof()} className={styles.button}>
                    withdraw with ZK Proof
                </div>
                <div onClick={() => addCrossChainID()} className={styles.button}>
                    add commitment cross chain
                </div>
            </main>
        </div>
    )
}
