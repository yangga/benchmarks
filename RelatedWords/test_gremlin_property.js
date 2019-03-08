const gremlin = require('gremlin');
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;

dc = new DriverRemoteConnection('ws://localhost:8182/gremlin', {});

const graph = new Graph();
const g = graph.traversal().withRemote(dc);

const VTX_NAME = 'word'
const PP_NAME = 'name'
const EDGE_NAME = 'next'

async function add_path(prev, next, weight=0.1) {
    if (prev === next) return

    const {
        addE,
        addV,
        constant,
        inE,
        outV,
        unfold,
        union,
        values,
    } = gremlin.process.statics

    await g
        .V().has(VTX_NAME, PP_NAME, prev).fold().coalesce(unfold(), addV(VTX_NAME).property(PP_NAME, prev))
        .V().has(VTX_NAME, PP_NAME, next).fold().coalesce(unfold(), addV(VTX_NAME).property(PP_NAME, next))
        .V().has(VTX_NAME, PP_NAME, prev).as('p')
        .V().has(VTX_NAME, PP_NAME, next).as('n')
        .coalesce(inE(EDGE_NAME).where(outV().as('p')), addE(EDGE_NAME).from_('p').property('weight', 0)).as('e')
        .property('weight', union(values('weight'), constant(weight)).sum())
        .iterate()
}

async function get_related_vertices(v_name, limit_cnt=10) {
    const {
        desc,
    } = gremlin.process.order

    return (await g
        .V()
        .has(VTX_NAME, PP_NAME, v_name)
        .outE(EDGE_NAME)
        .order().by('weight', desc)
        .inV()
        .dedup()
        .limit(limit_cnt)
        .values('name')
        .fold()
        .next()).value
}

async function drop_data() {
    await g.V().drop().iterate()
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
