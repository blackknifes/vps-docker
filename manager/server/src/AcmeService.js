import Database from "./Database";
import ExpressApp from "./ExpressApp";
import Result from "./Result";
import ChildProcess from "./ChildProcess";


/**
 * @typedef {"Cloudflare" | "DNSPod" | "Aliyun" | "HuaweiCloud"} DnsType
 */


const dnsList = ["Cloudflare", "DNSPod", "Aliyun", "HuaweiCloud"]

class AcmeService {
    db;

    /**
     * 
     * @param {Database} db 
     */
    constructor(db) {
        this.db = db.createMapper("acme");
    }

    listSupportDnsAPI() {
        return Result.ok(dnsList);
    }

    /**
     * 保存dns设置
     * @param {{dns: DnsType, value: Object}} params 
     */
    async saveDnsSetting(params) {
        switch (params.dns) {
            case "Aliyun":
                if (!value.Ali_Key || !value.Ali_Secret)
                    return Result.fail("参数错误");
                break;
            case "Cloudflare":
                if (!value.CF_Key || !value.CF_Email)
                    return Result.fail("参数错误");
                break;
            case "DNSPod":
                if (!value.DP_Id || !value.DP_Key)
                    return Result.fail("参数错误");
                break;
            case "HuaweiCloud":
                if (!value.HUAWEICLOUD_Username || !value.HUAWEICLOUD_Password || !value.HUAWEICLOUD_ProjectID)
                    return Result.fail("参数错误");
                break;
            default:
                break;
        }

        await this.db.insert({ dns: params.dns, ...params.value });
    }

    async listDnsSettings()
    {
        
    }

    /**
     * 申请证书
     * @param {{domain: string, ssl: string, dns: DnsType}} params 
     */
    async makeSSL(params) {
        //domain, sslDomain, dns
        // "acme.sh  --issue -d example.com  -d '*.example.com'  --dns dns_cf"
        if (dnsList.indexOf(params.dns) === -1)
            return Result.fail("错误的dns提供商");
        let env = this.db.get({ name: params.dns });
        if (!env)
            return Result.fail("未设置访问key");
        if (env.dns)
            delete env.dns;
        try {
            await ChildProcess.exec(["acme.sh", "--issue", "-d", domain, "-d", sslDomain, "--dns", params.dns], { env });
        } catch (error) {
            return Result.fail("创建证书失败: " + error);
        }
    }
}