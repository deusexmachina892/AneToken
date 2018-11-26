pragma solidity ^0.4.24;

import './AneToken.sol';

contract AneTokenSale{
    address admin;
    AneToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address indexed _buyer,
        uint256 _number
    );

    constructor(AneToken _tokenContract, uint256 _tokenPrice){
        //Assign an admin
        admin = msg.sender;

          //Token Contract
        tokenContract = _tokenContract;
      
        //Token Price
        tokenPrice = _tokenPrice;
    }
    //multiply
    function multiply(uint x, uint y) internal pure returns(uint z){
        require( y==0 || (z=x*y)/y==x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable{
        //Require that value is equal to tokens
        require(msg.value == multiply(tokenPrice, _numberOfTokens));

        //Require that contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        //Require that transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        //Keep track of tokens sold
        tokenSold += _numberOfTokens;

        //Trigger Sell Event
        Sell(msg.sender, _numberOfTokens);
    }

    //Ending the token sale
    function endSale() public{
        //Require only an admin can do this
        require(msg.sender == admin);

        //Transfer the remaining AneTokens back to the admin
        tokenContract.transfer(admin, tokenContract.balanceOf(address(this)));
        
        //Destroy contract
       selfdestruct(this);
    }
}