import '../img/icon-128.png'
import '../img/icon-34.png'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import Wallet from '@aeternity/aepp-sdk/es/wallet'
import BrowserRuntimeConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-connection/browser-runtime'


const account =  MemoryAccount({
    keypair: {
        secretKey: "YOUR_SECRET",
        publicKey: "YOUR_PUBLIC"
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
    // account
]
//
const postToContent = (data) => {
    chrome.tabs.query({}, function (tabs) { // TODO think about direct communication with tab
        const message = { method: 'pageMessage', data };
        tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, message)) // Send message to all tabs
    });
}


// Subscribe for runtime connection

// Send wallet connection info to Aepp throug content script
const NODE_URL = 'http://localhost:3013'
const NODE_INTERNAL_URL = 'http://localhost:3113'
const COMPILER_URL = 'https://compiler.aepps.com'

setInterval(() => postToContent({ method: 'wallet.await.connection', params: { name: 'TestWAELLET', id: 'chkpmppikmfpmijepmbgdkphhiegbkfp', network: 'mainnet' }}), 1000)

// Init extension stamp from sdk
Wallet({
    url: NODE_URL,
    internalUrl: NODE_INTERNAL_URL,
    compilerUrl: COMPILER_URL,
    // By default `ExtesionProvider` use first account as default account. You can change active account using `selectAccount (address)` function
    accounts: [],
    // Hook for sdk registration
    onConnection (client) {
        debugger
        if (confirm(`Client ${client.name} with id ${client.id} want to connect`)) {
            client.acceptConnection()
        }
    },
    onDisconnect (port) {
        debugger
    }
}).then(wallet => {
    // Subscribe for runtime connection
    chrome.runtime.onConnectExternal.addListener(async (port) => {
        // create Connection
        const connection = await BrowserRuntimeConnection({ connectionInfo: { id: port.sender.frameId }, port })
        // add new aepp to wallet
        wallet.addRpcClient(connection)
    })
    wallet.shareWalletInfo(postToContent)
}).catch(err => {
    console.error(err)
})
