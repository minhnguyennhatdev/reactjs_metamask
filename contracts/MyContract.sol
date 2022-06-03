pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyContract is ERC20 {
  address public admin;
  mapping(address => uint) balance;

  event _mint(address to, uint amount);
  constructor() ERC20("MyToken", "MTK") {
    _mint(msg.sender, 10000 * 10 ** 18);
    admin = msg.sender;
  }

  function mint(address to, uint amount) external {
    require(msg.sender == admin, 'only admin');
    _mint(to, amount);
  }
}