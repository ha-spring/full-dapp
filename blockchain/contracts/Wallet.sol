//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    IERC20 public USDC;

    constructor(IERC20 _USDC) {
        USDC = _USDC;
    }

    function transfer(address to, uint256 amount) public onlyOwner {
        USDC.transfer(to, amount);
    }

    function bulkTransfer(address[] calldata tos, uint256[] calldata amounts)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < tos.length; i++) {
            USDC.transfer(tos[i], amounts[i]);
        }
    }
}
