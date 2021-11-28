import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './ipfs'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ipfsHash: '',
      web3: null,
      buffer: null,
      account: null
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        this.simpleStorageInstance = instance
        this.setState({ account: accounts[0] })
        // Get the value from the contract to prove it worked.
        return this.simpleStorageInstance.get.call(accounts[0])
      }).then((ipfsHash) => {
        // Update state with the result.
        return this.setState({ ipfsHash })
      })
    })
  }

  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit(event) {
    event.preventDefault()
    ipfs.files.add(this.state.buffer, (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        // console.log('ifpsHash', this.state.ipfsHash)
      })
    })
  }

  render() {
    return (
      <div className="App felx-col space-y-4">
        <nav className="w-full h-max bg-white shadow-md p-2 flex items-center space-x-8">
          <div href="#" className="flex-col text-lg text-black w-20 h-20 p-2 border-border border-2 rounded flex justify-center items-start ml-4 text-left">
            <div className="brand1 font-bold">BLOCK</div>
            <div className="brand1 font-medium">DOC</div>
            </div>
          <div className="nav-txt text-black text-2xl font-medium"><b>BlockChain </b>Storage for your secured <b> documents</b></div>
        </nav>

        <main className="container w-full h-max mb-12 ">
          <div className=" flex w-full justify-center items-center h-screen">
            <div className="sub-cont flex w-3/4 h-screen justify-center items-center p-2">
              
              <div className="left-div w-1/2">
             
              <form onSubmit={this.onSubmit} className="w-96 h-96 rounded shadow-lg border-t-4 border-black p-4 space-y-12 flex-col justify-center">
                <p className="form-txt text-lg font-medium">Upload your document (.jpg,.png)</p>
                <input className="w-full h-8 rounded-md border-black border-2"type='file' onChange={this.captureFile} />
                <input type='submit' className="w-28 h-10 bg-black text-white rounded-md p-2 hover:bg-gray-800" />
              </form>
              </div>
              <div className="right-div w-96 h-96 flex-col text-black shadow-lg border-t-4 border-black  ">
                <div className="img-sec rounded-lg  p-4 flex-col justify-center ">
                  <p className="text-md font-medium">This image is stored on <b>IPFS</b> & The <b>Ethereum Blockchain</b>!</p>
                  <div className="img-wrap w-64 h-64 border-gray-600 border-2 rounded-lg ">
                  <img src={ `https://ipfs.io/ipfs/${this.state.ipfsHash}` } alt="img" width="70%" h="auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
