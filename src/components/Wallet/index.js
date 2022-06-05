import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap"
import avatar from '../../assets/avatar.png'
import noavatar from '../../assets/nowalletadded.png'
import { useState, useEffect, useCallback } from 'react';
import { loadContract } from "../../utils/load-contract";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

const Wallet = () => {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const [shouldReload, reload] = useState(false);
  const reloadEffect = () => reload(!shouldReload)

  const setAccountLister = (provider) => {
    provider.on("accountChanged", accounts => setAccount(accounts[0]))
  }

  window.ethereum.enable(); // get permission to access accounts

  // detect Metamask account change
  window.ethereum.on('accountsChanged', function (accounts) {
    getAccount()
  });

  const loadProvider = async () => {
    const provider = await detectEthereumProvider()
    const contract = await loadContract("MyContract", provider)

    console.log(contract)

    if (provider) {
      setAccountLister(provider)
      setWeb3Api({
        provider,
        web3: new Web3(provider),
        contract
      })
    } else {
      alert("Please Install Metamask")
    }
  }
  useEffect(() => {
    loadProvider()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAccount = async () => {
    const accounts = await web3Api.web3.eth.getAccounts()
    // web3Api.web3.eth.defaultAccount = accounts[0]
    setAccount(accounts[0])
  }

  const loadBalance = async () => {
    const { contract, web3 } = web3Api
    const balance = await contract.balanceOf(account)
    setBalance(web3.utils.fromWei(balance, "ether"))
  }

  useEffect(() => {
    web3Api.web3 && getAccount() && reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api.web3]);

  useEffect(() => {
    account && loadBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, shouldReload]);

  const mint = useCallback(async () => {
    const { contract, web3 } = web3Api
    const value = document.getElementById('amount').value;
    const receiver = document.getElementById('receiver').value;

    await contract.mint(
      receiver,
      web3.utils.toWei(value.toString(), "ether"),
      {
        from: "0x0b7Aa818E2d1C34ae314D8deC075d071020478f3"
      }
    )
    reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api, account])

  const getTotalSupply = useCallback(async () => {
    const { contract, web3 } = web3Api
    const totalSupply = await contract.totalSupply()

    alert(`Total supply: ${web3.utils.fromWei(totalSupply, 'ether')} ETH`)
    reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api, account])

  const transfer = useCallback(async () => {
    const { contract, web3 } = web3Api
    const amount = document.getElementById('amount').value;
    const receiver = document.getElementById('receiver').value;

    await contract.transfer(
      receiver,
      web3.utils.toWei(amount.toString(), "ether"),
      {
        from: account
      }
    ).then((reloadEffect()))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api, account])

  return (
    <>
      <Card className="w-auto h-fit max-w-md">
        <Card.Body>
        {/* <Card.Img variant="top" src={account ? avatar : noavatar} className="object-contain w-2/3 h-auto"/> */}
          {account ? (
            <>
              <OverlayTrigger
                key={account}
                placement="top"
                delay={{ show: 250, hide: 1500 }}
                overlay={
                  <Tooltip id={`tooltip-${account}`} >
                    <strong>{account}</strong>.
                  </Tooltip>
                }
              >
                <Card.Title className="truncate text-lg" >Account: {account ? account : "Account denied"}</Card.Title>
              </OverlayTrigger>
              <Card.Text className="text-lg">$ {balance} MTK (MyToken)</Card.Text>
              <form className="bg-white rounded">
                <div className="mb-3">
                  <input className="appearance-none border rounded w-full h-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="receiver" type="text" placeholder="Receiver" />
                </div>
                <div className="mb-3">
                  <input className="appearance-none border rounded w-full h-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="amount" type="text" placeholder="Amount" />
                </div>
                <div className="flex justify-between w-full">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded focus:outline-none focus:shadow-outline w-2/5 h-12" type="button" onClick={mint}>
                    Mint
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded focus:outline-none focus:shadow-outline w-2/5 h-12" type="button" onClick={getTotalSupply}>
                    Get Total Supply
                  </button>

                  {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-36 h-12" type="button" onClick={send}>
                    Transfer
                  </button> */}
                </div>
                <div className="flex justify-between w-full mt-3">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded focus:outline-none focus:shadow-outline w-2/5 h-12" type="button" onClick={transfer}>
                    Transfer
                  </button>
                
                </div>
              </form>
            </>
          ) : (
            <div className="w-full h-auto flex justify-center">
              <Button
                onClick={() => web3Api.provider.request({ method: 'eth_requestAccounts' })}
              >
                Connect Wallets
              </Button>
            </div>
          )}


        </Card.Body>
      </Card>
    </>
  )
}

export default Wallet