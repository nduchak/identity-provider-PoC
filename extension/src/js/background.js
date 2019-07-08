import '../img/icon-128.png'
import '../img/icon-34.png'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import { RpcWallet } from '@aeternity/aepp-sdk/es/ae/wallet'
import BrowserRuntimeConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-connection/browser-runtime'


const account =  MemoryAccount({
    keypair: {
        secretKey: "e6a91d633c77cf5771329d3354b3bcef1bc5e032c43d70b6d35af923ce1eb74dcea7ade470c9f99d9d4e400880a86f1d49bb444b62f11a9ebb64bbcfeb73fef3",
        publicKey: "ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi"
    }
})

// Init accounts
const accounts = [
    // You can add your own account implementation,
    // Account.compose({
    //     init() {
    //     },
    //     methods: {
    //         /**
    //          * Sign data blob
    //          * @function sign
    //          * @instance
    //          * @abstract
    //          * @category async
    //          * @rtype (data: String) => data: Promise[String]
    //          * @param {String} data - Data blob to sign
    //          * @return {String} Signed data blob
    //          */
    //         async sign(data) {
    //         },
    //         /**
    //          * Obtain account address
    //          * @function address
    //          * @instance
    //          * @abstract
    //          * @category async
    //          * @rtype () => address: Promise[String]
    //          * @return {String} Public account address
    //          */
    //         async address() {
    //         }
    //     }
    // })(),
    account
]
//
const postToContent = (data) => {
    chrome.tabs.query({}, function (tabs) { // TODO think about direct communication with tab
        const message = { method: 'pageMessage', data };
        tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, message)) // Send message to all tabs
    });
}


// Send wallet connection info to Aepp throug content script
const NODE_URL = 'http://localhost:3013'
const NODE_INTERNAL_URL = 'http://localhost:3113'
const COMPILER_URL = 'https://compiler.aepps.com'

setInterval(() => postToContent({ method: 'wallet.await.connection', params: { name: 'TestWAELLET', id: 'chkpmppikmfpmijepmbgdkphhiegbkfp', network: 'mainnet' }}), 1000)

// Init extension stamp from sdk
RpcWallet({
    url: NODE_URL,
    internalUrl: NODE_INTERNAL_URL,
    compilerUrl: COMPILER_URL,
    // By default `ExtesionProvider` use first account as default account. You can change active account using `selectAccount (address)` function
    accounts,
    // Hook for sdk registration
    onConnection (aepp) {
        if (confirm(`Client ${aepp.info.name} with id ${aepp.id} want to connect`)) {
            aepp.acceptConnection()
        }
    },
    onDisconnect (port) {
        debugger
    },
    onSubscription (aepp) {
        if (confirm(`Aepp ${aepp.info.name} with id ${aepp.id} want to subscribe for accounts`)) {
            aepp.allowSubscription()
        }
    },
    onSign (aepp, action) {
        if (confirm(`Aepp ${aepp.info.name} with id ${aepp.id} want to sign tx ${action.params.tx}`)) {
            action.accept()
        }
    }
}).then(wallet => {
    // Subscribe for runtime connection
    chrome.runtime.onConnectExternal.addListener(async (port) => {
        // create Connection
        const connection = await BrowserRuntimeConnection({ connectionInfo: { id: port.sender.frameId }, port })
        // add new aepp to wallet
        wallet.addRpcClient(connection)
    })
    // Share wallet info with extensionId to the page
    wallet.shareWalletInfo(postToContent)
}).catch(err => {
    console.error(err)
})
