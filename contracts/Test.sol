// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interface/FlashLoanReceiverBase.sol";
import "./interface/ILendingPoolAddressesProvider.sol";
import "./interface/ILendingPool.sol";

/**@dev FlashloanV1 is derived from FlashLoanReceiverBaseV1 */
contract FlashloanV1 is FlashLoanReceiverBaseV1 {
    constructor(address _addressProvider)
        public
        FlashLoanReceiverBaseV1(_addressProvider)
    {}

    /**
        Flash loan 1000000000000000000 wei (1 ether) worth of `_asset`
     */
    function flashloan(address _asset) public onlyOwner {
        bytes memory data = "";
        uint256 amount = 1 ether;

        ILendingPoolV1 lendingPool = ILendingPoolV1(
            addressesProvider.getLendingPool()
        );
        lendingPool.flashLoan(address(this), _asset, amount, data);
    }

    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address _reserve,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    ) external override {
        /** @desc check the amount of flashloan */
        require(
            _amount <= getBalanceInternal(address(this), _reserve),
            "Invalid balance, was the flashLoan successful?"
        );

        /**
            Please write your code here
         */
        uint256 totalDebt = _amount.add(_fee);
        transferFundsBackToPoolInternal(_reserve, totalDebt);
    }
}
