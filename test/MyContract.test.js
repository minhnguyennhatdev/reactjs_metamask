const MyContract = artifacts.require("MyContract");

contract("MyContract", (accounts) => {
  before(async () => {
    mycontract = await MyContract.deployed();
  })

  it("Gives owner of the token 1M tokens", async () => {
    let balance = await mycontract.balanceOf(accounts[0])
    console.log(web3.utils.fromWei(balance, 'ether'))
  })
})