import '../img/icon-128.png'
import '../img/icon-34.png'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import Account from '@aeternity/aepp-sdk/es/account'
import ExtensionProvider from '@aeternity/aepp-sdk/es/provider/extension'


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
    account
]

const postToContent = (data) => {
    chrome.tabs.query({}, function (tabs) { // TODO think about direct communication with tab
        const message = { method: 'pageMessage', data };
        tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, message)) // Send message to all tabs
    });
}

// Init extension stamp from sdk
ExtensionProvider({
    // Provide post function (default: window.postMessage)
    postFunction: postToContent,
    // By default `ExtesionProvider` use first account as default account. You can change active account using `selectAccount (address)` function
    accounts: accounts,
    // Hook for sdk registration
    onSdkRegister: function (sdk) {
        // sendDataToPopup(this.getSdks())
        if (confirm('Do you want to share wallet with sdk ' + sdk.sdkId)) sdk.shareWallet() // SHARE WALLET WITH SDK
    },
    // Hook for signing transaction
    onSign: function ({sdkId, tx, txObject, sign}) {
        // sendDataToPopup(this.getSdks())
        if (confirm('Do you want to sign ' + JSON.stringify(txObject) + ' ?')) sign() // SIGN TX
    },
    // Hook for broadcasting transaction result
    onBroadcast: function (sdk) {
        console.log(sdk)
    }
}).then(provider => {
    // Subscribe from postMessages from page
    chrome.runtime.onMessage.addListener((msg, sender) => {
        switch (msg.method) {
            case 'pageMessage':
                provider.processMessage(msg);
                break
        }
    })
}).catch(err => {
    console.error(err)
})
