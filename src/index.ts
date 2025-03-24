import Kuramisa from "./Kuramisa";

const kuramisa = new Kuramisa();

kuramisa.login();

export const useClient = () => kuramisa;
