import childProcess from "child_process";


export default {
    /**
     * 
     * @param {string[]} cmdList 
     * @param {{cwd?: string, env?: object}} [options]
     * @return {Promise<void>}
     */
    exec(cmdList, options) {
        return new Promise((resolve, reject) => {
            if (!options)
                options = {};
            
            options.detached = true;
            options.windowsHide = true;
            options.shell = true;
            if (!options.timeout)
                options.timeout = 60000;

            let process = childProcess.spawn(cmdList[0], cmdList.slice(1), options);
            process.once("error", (err) => {
                reject(err.message);
            })

            process.once("exit", (code) => {
                if (code == 0)
                    resolve();
            })
        });
    }
};