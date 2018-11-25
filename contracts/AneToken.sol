pragma solidity ^0.4.2;

contract AneToken{
    //ERC 20 requires a name and a symbol
    string public constant name = 'Ane Token';
    string public constant symbol = 'ANE';
    string public constant standard = 'Ane Token v1.0'; 
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    //allowance
    mapping(address => mapping(address=>uint256)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender]  = _initialSupply;
        totalSupply = _initialSupply;

    }

    //Transfer function is required
    function transfer(address _to, uint256 _value) public returns(bool success){
    //Exception if does not have enough
    require(balanceOf[msg.sender] >= _value);
    
    //Transfer an amount
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    //Transfer event
    Transfer(msg.sender, _to, _value);

    //bool return to indicate transaction status
    return true;
    }

    //Delegated Transfer

    //approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        //Allowance
        allowance[msg.sender][_spender] = _value; 
        //Approve Event
        Approval(msg.sender, _spender, _value);
        return true;     
    }

    //transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {

        //Require _from has enough tokens
        require(balanceOf[_from] >= _value);
        //Require allowance is big enough
        require(allowance[_from][msg.sender] >= _value);

        //Transfer Event
        Transfer(_from, _to, _value); 

        //Change balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        //Update Allowance
        allowance[_from][msg.sender] -= _value;
        
        //return a boolean
        return true;    
    }
}