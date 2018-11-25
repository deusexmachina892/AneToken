var AneToken = artifacts.require('./AneToken.sol');

contract('AneToken', function(accounts){ 
    var tokenInstance;
    it('initializes the contract with the correct values', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance; 
            return tokenInstance.name();
        }).then(function(name){
            console.log(name);
             assert.equal(name, 'Ane Token', 'has the correct name');
             return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, 'ANE', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, 'Ane Token v1.0', 'has the correct standard');
        })
    })


    it('allocates the initial supply upon deployment', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000,
            'sets the total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000,
            'allocates initial supply to admin')
        });
    });

    it('transfers token ownership', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance;
            //Test `require` statement by sending something larger than the sender's balance    
            return tokenInstance.transfer.call(accounts[1], 999999999999999)
        }).then(assert.fail).catch(function(error){
            //console.log(error.message.indexOf('revert'))
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000,{from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000,{from: accounts[0]});
        }).then(function(receipt){
            //console.log(receipt.logs);
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 250000, 'it add the balance correctly to the transferee');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance, 750000, 'it deducts the amount from the transferer')
        });
    });

    it('approves tokens for delegated transfer', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokems are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the approved amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        });
    });

    it('handles delegated token transfer', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt){
            //Approve spending account to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount})
        }).then(function(receipt){
            //Try something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 200,{from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert.equal(error.message.indexOf('revert') >= 0, true, 'cannot transfer balance larger than sender balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20,{from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert.equal(error.message.indexOf('revert') >= 0, true, 'cannot transfer amount larger than allowance');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 5, {from: spendingAccount});
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 5, {from: spendingAccount});
        }).then(function(receipt){
            //console.log(receipt)
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokems are transferred from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 5, 'logs the transferred amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.equal(balance, 95, 'deducts the amount from the sendingAccount');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.equal(balance, 5, 'adds the amount to the toAccount');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
           // console.log(tokenInstance.contract.allowance)
            assert.equal(allowance.toNumber(), 5, 'updates the allowance');
        });
    })
});