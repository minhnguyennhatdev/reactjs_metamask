pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyContract is ERC20 {
  address public admin;

  constructor(uint256 _supply) ERC20("MyToken", "MTK") {
    _mint(msg.sender, _supply *(10 ** decimals()));
    admin = msg.sender;
  }

  function mint(address to, uint amount) external {
    require(msg.sender == admin, 'only admin');
    _mint(to, amount);
  }
}