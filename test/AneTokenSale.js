var AneToken = artifacts.require('./AneToken.sol');
var AneTokenSale = artifacts.require('./AneTokenSale.sol');

contract('AneTokenSale', function(accounts){
    var tokenInstance;
    var tokensaleInstance;
    var tokensaleInstance2;
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens;
    var tokenPrice = 1000000000000000; //in wei (0.001 ether)
    var tokensAvailable = 750000;
    var initialAdminBalance = 250000;
    var remainContractBalanceTransferred;
    it('initializes with the correct values', function(){
        return AneTokenSale.deployed().then(function(instance){
            tokensaleInstance = instance;
            return tokensaleInstance.address;
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has contract address');
            return tokensaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokensaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price.toNumber(), tokenPrice, 'token price is correct');
        });
    })

    it('facilitates token buying', function(){
        return AneToken.deployed().then(function(instance){
            //Grab the token instance first
            tokenInstance = instance;
            return AneTokenSale.deployed();
        }).then(function(instance){
            //then grab the tokenSale instance
            tokensaleInstance = instance;
            //Provsion 75% of all tokens to the token sale
            return tokenInstance.transfer(tokensaleInstance.address,tokensAvailable, {from: admin});
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokensaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens*tokenPrice})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._number, numberOfTokens, 'logs the number of tokens purchased');
            return tokensaleInstance.tokenSold();
        }).then(function(number){
            assert.equal(number.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            //Try to buy tokens different from the ether value
            return tokensaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1})
        }).then(assert.fail).catch(function(error){
            assert.equal(error.message.indexOf('revert') >= 0, true, 'cannot buy tokens for a price less or more than actual price');
            return tokensaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens*tokenPrice})
        }).then(assert.fail).catch(function(error){
            //console.log(error)
            assert.equal(error.message.indexOf('revert') >= 0, true, 'cannot buy tokens more than available tokens');
            return tokenInstance.transfer.call(buyer, numberOfTokens,{from: admin});
        }).then(function(success){
            assert.equal(success, true, 'transfer of token has to be successful');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokens, 'balance of buyer has to be equal to number of tokens bought');
            return tokenInstance.balanceOf(tokensaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), (tokensAvailable - numberOfTokens), 'balance of token sale contract has to be the outstanding number of tokens after token sale')
        });
    });

    it('ends token sale', function(){
        return AneToken.deployed().then(function(instance){
            tokenInstance = instance;
            return AneTokenSale.deployed();
        }).then(function(instance){
                tokensaleInstance2 = instance;
                console.log(tokensaleInstance2.address)
                return tokensaleInstance2.endSale({from: buyer});
            }).then(assert.fail).catch(function(error){
                console.log(error)
                assert.equal(error.message.indexOf('revert')>=0, true, 'endsale() can only be called by admin');
                return tokenInstance.balanceOf(tokensaleInstance2.address);
            }).then(function(balance){
                console.log(tokensaleInstance2);
                remainContractBalanceTransferred = balance.toNumber();
                return tokensaleInstance2.endSale({from: admin})
            }).then(function(receipt){
                return tokenInstance.balanceOf(tokensaleInstance2.address);
            }).then(function(balance){
                assert.equal(balance.toNumber(), 0, 'token sale contract should have 0 tokens left');
                return tokenInstance.balanceOf(admin);
            }).then(function(balance){
                assert.equal(balance.toNumber(), (initialAdminBalance+remainContractBalanceTransferred));
                //Check token price was reset when selfdestruct() was called
                return tokensaleInstance2.tokenPrice();
            }).then(function(price){
                assert.equal(price.toNumber(), 0, 'token price should be 0');
             })
    })
})