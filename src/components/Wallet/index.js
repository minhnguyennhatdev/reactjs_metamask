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

  const [receiver, setReceiver] = useState(null);
  const [amount, setAmount] = useState(null);

  const setAccountLister = (provider) => {
    provider.on("accountChanged", accounts => setAccount(accounts[0]))
  }

  useEffect(() => {
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
    loadProvider()
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      // web3Api.web3.eth.defaultAccount = accounts[0]
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccount() && reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api.web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const balance = await web3.eth.getBalance(account)
      setBalance(web3.utils.fromWei(balance, "ether"))
    }
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
        from: account
      }
    )
    reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api, account])

  const getTotalSupply = useCallback(async () => {
    const { contract, web3 } = web3Api
    const totalSupply = await contract.totalSupply()
    console.log( web3.utils.fromWei(totalSupply, 'ether'))
    alert(`Total supply: ${web3.utils.fromWei(totalSupply, 'ether')} ETH`)
    reloadEffect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Api, account])


  // const send = async () => {
  //   const { contract, web3 } = web3Api
  //   await contract.send(account, {
  //     receiver,
  //     amount: web3.utils.toWei(amount.toString(), "ether")
  //   })
  //   reloadEffect()
  // }

  return (
    <Card className="w-96 h-auto">
      <Card.Img variant="top" src={account ? avatar : noavatar} />
      <Card.Body>
        {account ? (
          <>
            <OverlayTrigger
              key={account}
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={
                <Tooltip id={`tooltip-${account}`}>
                  <strong>{account}</strong>.
                </Tooltip>
              }
            >
              <Card.Title className="truncate text-lg" >Account: {account ? account : "Account denied"}</Card.Title>
            </OverlayTrigger>
            <Card.Text className="text-lg">$ {balance} ETH</Card.Text>
            <form className="bg-white rounded pt-1 pb-3">
              <div className="mb-3">
                <input className="appearance-none border rounded w-full h-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="receiver" type="text" placeholder="Receiver" />
              </div>
              <div className="mb-3">
                <input className="appearance-none border rounded w-full h-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="amount" type="text" placeholder="Amount" />
              </div>
              <div className="flex justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-36 h-12" type="button" onClick={mint}>
                  Mint
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded focus:outline-none focus:shadow-outline w-36 h-12" type="button" onClick={getTotalSupply}>
                  Get Total Supply
                </button>
                {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-36 h-12" type="button" onClick={send}>
                  Transfer
                </button> */}
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
  )
}

export default Wallet