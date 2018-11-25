pragma solidity ^0.4.2;

contract AneToken{
    string public constant name = 'Ane Token';
    string public constant symbol = 'ANE';
    string public constant standard = 'Ane Token v1.0'; 
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender]  = _initialSupply;
        totalSupply = _initialSupply;

    }
    //Transfer

    function transfer(address _to, uint256 _value) public returns(bool success){
    //Exception if does not have enough
    require(balanceOf[msg.sender] >= _value);
    
    //Transfer an amount
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    //Transfer event
    Transfer(msg.sender, _to, _value);

    return true;
    }
}