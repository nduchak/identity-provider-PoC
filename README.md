# identity-provider-PoC
Aepp with identity extension example

# Installation
1) You need to add your `keypair` to extension. It's can be done in `extension/src/js/background.js`
```
const account =  MemoryAccount({
    keypair: {
        secretKey: "YOUR_SECRET",
        publicKey: "YOUR_PUBLIC"
    }
})
```
2) You need to point Aepp to node. It's can be done in `aepp/src/component/Home.vue`
``` 
it's pointed to testnet by default
const NODE_URL = 'https://sdk-tesnet.aepps.com'
const NODE_INTERNAL_URL = 'https://sdk-tesnet.aepps.com'
```

3) You need to build and install extension(check extension README)
4) You need to build and run Aepp(check aepp README)
5) Go to `localhost:9001`