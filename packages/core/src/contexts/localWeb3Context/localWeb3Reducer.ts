import { LocalWeb3State, Actions } from "./types";

export const localWeb3ContextReducer = (
  state: LocalWeb3State,
  action: Actions
): LocalWeb3State => {
  switch (action.type) {
    case "addToken":
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [action.payload.id]: { ...action.payload.token },
        },
      };
    case "updateTokenBalanceAllowance":
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [action.payload.id]: {
            ...state.tokens[action.payload.id],
            balance: action.payload.balance,
            balanceBN: action.payload.balanceBN,
            spenderAllowance: action.payload.spenderAllowance,
          },
        },
      };
    case "resetTokens":
      return { ...state, tokens: {} };
    case "setAddress":
      return {
        ...state,
        address: action.payload,
      };
    case "setBalance":
      return {
        ...state,
        ethBalance: action.payload,
      };
    case "setIsReady":
      return {
        ...state,
        isReady: action.payload,
      };
    case "setWallet": {
      const { payload: { wallet, provider } } = action
      return {
        ...state,
        wallet: wallet!,
        provider: provider!,
        savedWallet: wallet?.name!
      };
    }
    case "setProvider":
      return {
        ...state,
        provider: action.payload,
      };
    case "setNetworkAndProvider": {
      const { payload: { network, provider } } = action
      return {
        ...state,
        network,
        provider: provider!,
      };
    }
    case "setNetwork": {
      const { payload } = action
      return {
        ...state,
        network: payload
      }
    }
    case "setOnBoard":
      return {
        ...state,
        onboard: action.payload,
      };
    case 'setWalletConnect': {
      const { payload: { wallet, provider } } = action
      return {
        ...state,
        wallet: wallet!,
        provider: provider!,
        savedWallet: wallet?.name!
      }
    }
    case 'setSavedWallet':
      return {
        ...state,
        savedWallet: action.payload
      }
    default:
      return state;
  }
};
