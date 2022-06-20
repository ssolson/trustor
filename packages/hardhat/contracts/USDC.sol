pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDC is ERC20, Ownable {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1000 * 10**6);
    }

    function mint(address _address, uint256 amt) external {
        _mint(_address, amt);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}