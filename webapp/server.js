// 导入 Express 框架
const express = require('express');
const Web3 = require('web3');
const erc20Ticker="000000000000000000"
var bannedUrlList=[]
//"https://www.google.com.hk/search?q=hardhat%E9%83%A8%E7%BD%B2%E5%88%B0%E6%B5%8B%E8%AF%95%E7%BD%91&newwindow=1&ei=Kl8sZJzOC_Ok2roPguy6qAU&ved=0ahUKEwici-b44JD-AhVzklYBHQK2DlUQ4dUDCA8&uact=5&oq=hardhat%E9%83%A8%E7%BD%B2%E5%88%B0%E6%B5%8B%E8%AF%95%E7%BD%91&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIJCCEQoAEQChAqMgcIIRCgARAKMgcIIRCgARAKOgoIABBHENYEELADOhwIABCKBRDqAhC0AhCKAxC3AxDUAxDVAxDlAhgBOhkIABCKBRDqAhC0AhCKAxC3AxDUAxDlAhgBOgUIABCABDoLCAAQgAQQsQMQgwE6EQguEIAEELEDEIMBEMcBENEDOhQILhCABBCxAxCDARDHARDRAxDUAjoLCC4QgAQQsQMQgwE6CwgAEIoFELEDEIMBOg4ILhCABBCxAxCDARDUAjoECAAQAzoNCC4QigUQxwEQ0QMQQzoICAAQgAQQsQM6CwguEIMBELEDEIAEOg0IABCKBRCxAxCDARBDOgcIABCKBRBDOhMIABANEIAEELEDEIMBELEDEIMBOgcIABANEIAEOgcIABCABBAMOgUIABCiBDoFCCEQoAFKBAhBGABQmQRY2VZg3VdoB3ABeAGAAfABiAGDGJIBBzEwLjE1LjGYAQCgAQGwAQrIAQrAAQHaAQQIARgH&sclient=gws-wiz-serp"]




var deliveryDates=[1688054400,1696003200,1703952000]
var websiteRank=[]
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_minStake",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "unlockTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "website",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "delivery_date",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isUpvote",
				"type": "bool"
			}
		],
		"name": "voteMyStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_other_score",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "other_score1",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "get_trust_score",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "trust_score1",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "website",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "delivery_date",
				"type": "uint256"
			}
		],
		"name": "getPoolDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "upvotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "downvotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pool_trade_times",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user_address",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "website",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "delivery_date",
				"type": "uint256"
			}
		],
		"name": "getUserDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "upvotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "downvotes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			}
		],
		"name": "isFutureDate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "other_score",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "trust_score",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"name": "userVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "web_pool_state",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "upvotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "downvotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pool_trade_times",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "web_pool_trade",
		"outputs": [
			{
				"internalType": "address",
				"name": "trade_address",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "trade_timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "trust_score",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "other_score",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isUpvote",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const contractAddress = "0x7f803587ab6832958E408FBbDA7343766d5a8e05"; // 智能合约地址
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com/')); // 替换为您的Ethereum节点URL
const contract = new web3.eth.Contract(contractABI, contractAddress);



async function fetchPoolDetails() {
  var websiteInfos = []
  for (var i=0;i<bannedUrlList.length;i++){
    let websiteInfo=new Object();
    websiteInfo.url=bannedUrlList[i]
    websiteInfo.upvotes=0
    websiteInfo.downvotes=0
    websiteInfo.pool_trade_times=0
    websiteInfo.score=0
	let upvotesBN=web3.utils.toBN(0)
	let downvotesBN=web3.utils.toBN(0)
    for (var j=0;j<deliveryDates.length;j++){
      try {
        const result = await contract.methods.getPoolDetails(bannedUrlList[i], deliveryDates[j]).call();
        console.log("Pool Details:", result);
        if (result.pool_trade_times=='0'){
          continue;
        }
		upvotesBN=upvotesBN.add(web3.utils.toBN(result.upvotes))
		downvotesBN=downvotesBN.add(web3.utils.toBN(result.downvotes))
        websiteInfo.pool_trade_times+=parseInt(result.pool_trade_times);
        websiteInfo.score+=i;
        console.log(websiteInfo);
      } catch (error) {
        console.error("Error fetching pool details:", error);
        break
      }
    }
	websiteInfo.upvotes=web3.utils.fromWei(upvotesBN, 'ether');
	websiteInfo.downvotes=web3.utils.fromWei(downvotesBN, 'ether');
	websiteInfos.push(websiteInfo);
  }
  console.log(websiteInfos)
  console.log(bannedUrlList)
  websiteRank=websiteInfos
}
fetchPoolDetails()

// 定时任务
setInterval(fetchPoolDetails,20000);

const app = express();


function getBannedUrlList(){
    return websiteRank
}

// 静态文件服务器，将静态文件目录设置为项目根目录
app.use(express.static(__dirname + '/static'));

// 处理 GET /rank 路径请求
app.get('/rank', (req, res) => {
  // 返回一个简单的 HTML 页面，显示排名信息
  res.sendFile(__dirname+"/static/rank.html")
});

// 处理 GET /index 路径请求
app.get('/index', (req, res) => {
  // 返回一个简单的 HTML 页面，显示排名信息
  res.sendFile(__dirname+"/static/index.html")
});

// 处理 GET /index 路径请求
app.get('/person', (req, res) => {
  // 返回一个简单的 HTML 页面，显示个人信息
  res.sendFile(__dirname+"/static/user_info.html")
});

app.get('/api/addBannedUrl',(req,res)=>{
  // 解析url
  // 加入数组
  const url = req.query.attachUrl;
  if (url){
	  for(var i=0;i<bannedUrlList.length;i++){
		  if (url==bannedUrlList[i]){
			res.send(`URL "${url}" 已加入到屏蔽列表。`)
			return
		  }
	  }
	bannedUrlList.push(url);
    res.send(`URL "${url}" 已加入到屏蔽列表。`)
  }else{
    res.status(400).send('缺少 "url" 参数。');
  }
})

app.get('/api/getBannedUrlList',(req,res) =>{
    // 返回一个简单list
    const data={
        code: 2001,
        data: getBannedUrlList()
    };
    res.json(data)
});

// 启动服务器，监听端口 3000
app.listen(3001, () => {
  console.log('服务器已启动，访问 http://localhost:3000/rank 查看排名页面。');
});
