App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  initMetaMask: function() {

    async function enableUser() {
        const accounts = await ethereum.enable();
        const account = accounts[0];
        App.account = account;
    }
    enableUser();
},

  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("DYMtokenSale.json", function (DYMtokenSale) {
      App.contracts.DYMtokenSale = TruffleContract(DYMtokenSale);
      App.contracts.DYMtokenSale.setProvider(App.web3Provider);
      App.contracts.DYMtokenSale.deployed().then(function (DYMtokenSale) {
        console.log("DYM Token Sale Address:", DYMtokenSale.address);
      });
    }).done(function () {
      $.getJSON("DYMtoken.json", function (DYMtoken) {
        App.contracts.DYMtoken = TruffleContract(DYMtoken);
        App.contracts.DYMtoken.setProvider(App.web3Provider);
        App.contracts.DYMtoken.deployed().then(function (DYMtoken) {
          console.log("DYM Token Address:", DYMtoken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.DYMtokenSale.deployed().then(function (instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function (error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.DYMtokenSale.deployed().then(function (instance) {
      DYMtokenSaleInstance = instance;
      return DYMtokenSaleInstance.tokenPrice();
    }).then(function (tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return DYMtokenSaleInstance.tokensSold();
    }).then(function (tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.DYMtoken.deployed().then(function (instance) {
        DYMtokenInstance = instance;
        return DYMtokenInstance.balanceOf(App.account);
      }).then(function (balance) {
        $('.DYM-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function () {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.DYMtokenSale.deployed().then(function (instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function (result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function () {
  $(window).load(function () {
    App.initMetaMask();
    App.init();
  })
});
