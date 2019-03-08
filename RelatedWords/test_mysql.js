var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '####',
  database : '####'
});
connection.connect();

async function add_path(prev, next, weight=0.1) {
    await new Promise((resolve, reject) => {
        connection.query(`
        INSERT INTO word_search (word, \`to\`) VALUES ('${prev}', '${next}')  
        ON DUPLICATE KEY UPDATE weight=weight+1; 
        `, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}

async function get_related_vertices(v_name, limit_cnt=10) {
    return await new Promise((resolve, reject) => {
        connection.query(`
            SELECT \`to\`
            FROM word_search
            WHERE word='${v_name}'
            ORDER BY weight
            LIMIT ${limit_cnt}
        `, (err, res) => {
            if (err) return reject(err)
            resolve(res.map(r => r.to))
        })
    })      
}

async function drop_data() {
    await new Promise((resolve, reject) => {
        connection.query(`
        TRUNCATE TABLE word_search`, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
    console.log('#cleared datas')
}

async function main() {
    await drop_data()

    // await add_path('abc', 'def')
    // await add_path('abc', '111', 0.2)
    // await add_path('abc', '222', 0.3)

    // console.log('#abc related -', await get_related_vertices('abc'))

    const loop_cnt = 10000
    const start = new Date().getTime()

    for (let i=0; i<loop_cnt; i++) {
        await add_path(`${i}`, `${i+1}`)
        //console.log('@', i)
    }

    const tickInitDB = new Date().getTime()

    for (let i=0; i<loop_cnt; i++) {
        const res = await get_related_vertices(`${i}`)
        //console.log('#', i, res)
    }

    const tickDoneSearch = new Date().getTime()

    console.log('#elapsedTime - initDB', (tickInitDB-start)/1000)
    console.log('#elapsedTime - searching', (tickDoneSearch-start)/1000)

    console.log('#done')

    //dc.close();
}

main()
