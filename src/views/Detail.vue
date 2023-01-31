<template>
  <div class="main">
    <div class="topWrap">
      <div class="topTitle">
        <img src="@/assets/标题样式.png" />
        <span class="text">Overview of data results</span>
      </div>
      <div class="topButton">
        <div
          :class="['longBtn', currentMenu === 'builds' ? 'active' : '']"
          @click="clickMenu('builds')"
        >
          <img v-if="currentMenu !== 'builds'" src="@/assets/最近默认.png" />
          <img src="@/assets/最近选中.png" v-else /><span>recent builds</span>
        </div>
        <div
          :class="['longBtn', currentMenu === 'scheduled' ? 'active' : '']"
          @click="clickMenu('scheduled')"
        >
          <img
            v-if="currentMenu !== 'scheduled'"
            src="@/assets/日历默认.png"
          /><img v-else src="@/assets/日历选中.png" /><span
            >currently scheduled</span
          >
        </div>
      </div>
    </div>
    <div class="mainTable">
      <Table
        :columns="mainTableColumns"
        :data="mainTableData"
        :loading="mainLoading"
      >
        <template slot-scope="{ row }" slot="categoryLevel">
          <div @click="clickMainData(row, '')" class="mainTableData">
            {{ row.categoryLevel }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="allPackage">
          <div @click="clickMainData(row, '')" class="mainTableData">
            {{ row.allPackage }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="reproducible">
          <div
            @click="clickMainData(row, 'reproducible')"
            class="mainTableData"
          >
            {{ row.reproducible }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="unreproducible">
          <div
            @click="clickMainData(row, 'unreproducible')"
            class="mainTableData"
          >
            {{ row.unreproducible }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="failingToBuild">
          <div
            @click="clickMainData(row, 'failing to build')"
            class="mainTableData"
          >
            {{ row.failingToBuild }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="inDepwaitState">
          <div
            @click="clickMainData(row, 'in depwait state')"
            class="mainTableData"
          >
            {{ row.inDepwaitState }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="downloadProblems">
          <div
            @click="clickMainData(row, 'download problems')"
            class="mainTableData"
          >
            {{ row.downloadProblems }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="blacklisted">
          <div @click="clickMainData(row, 'blacklisted')" class="mainTableData">
            {{ row.blacklisted }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="unknownState">
          <div
            @click="clickMainData(row, 'unknown state')"
            class="mainTableData"
          >
            {{ row.unknownState }}
          </div>
        </template>
      </Table>
    </div>
    <div class="detailTitle">{{ detailTitle }}</div>
    <div class="detailTable">
      <Table
        :columns="detailTableColumns"
        :data="detailTableData"
        :loading="detailLoading"
      >
        <template slot-scope="{ row }" slot="testResult">
          <div v-for="(result, index) in row.testResult" :key="index">
            <div
              v-if="
                result.search(/.rpm/) >= 0 &&
                row.testStatus !== 'failing to build'
              "
            >
              <img class="testResultImg" :src="getImgSrc(result)" />
              <a @click="clickTestResult(row, getStatus(result), index)">{{
                result.slice(0, result.search(/.rpm/) + 4)
              }}</a
              >{{ result.slice(result.search(/.rpm/) + 4) }}
            </div>
            <div v-else>
              <img class="testResultImg" :src="getImgSrc(result)" />
              {{ result }}
            </div>
          </div>
        </template>
        <template slot-scope="{ row }" slot="time">
          <div>{{ row.testDate }}</div>
          <div>{{ row.testDuration }}</div>
        </template>
        <template slot-scope="{ row }" slot="log">
          <div v-if="row.firstBuildLog">
            <a target="_blank" :href="row.firstBuildLog">build1.log</a
            >{{ `(${row.firstLogSize})` }}
          </div>
          <div v-if="row.secondBuildLog">
            <a target="_blank" :href="row.secondBuildLog"> build2.log </a
            >{{ `(${row.secondLogSize})` }}
          </div>
        </template>
      </Table>
      <div class="paginationWrap">
        <div>
          <Page
            show-sizer
            show-elevator
            show-total
            :total="detailTableTotal"
            :current="detailTablePageNum"
            @on-change="changeDetailTablePage"
            @on-page-size-change="changeDetailTableSize"
          ></Page>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import Footer from '../components/Footer.vue';

export default {
  components: { Footer },
  data() {
    return {
      currentMenu: 'builds',
      mainTableColumns: [
        {
          title: 'categoryLevel',
          slot: 'categoryLevel',
          minWidth: 150,
        },
        {
          title: 'all source packages',
          slot: 'allPackage',
          minWidth: 140,
        },
        {
          title: 'reproducible',
          slot: 'reproducible',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
        {
          title: 'unreproducible',
          slot: 'unreproducible',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
        {
          title: 'failing to build',
          slot: 'failingToBuild',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
        {
          title: 'in depwait state',
          slot: 'inDepwaitState',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
        {
          title: 'download problems',
          slot: 'downloadProblems',
          renderHeader: this.renderMainCol,
          minWidth: 140,
        },
        {
          title: 'blacklisted',
          slot: 'blacklisted',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
        {
          title: 'unknown state',
          slot: 'unknownState',
          renderHeader: this.renderMainCol,
          minWidth: 120,
        },
      ],
      mainTableData: [],
      detailTableColumns: [
        {
          title: 'categoryLevel',
          key: 'categoryLevel',
          minWidth: 150,
        },
        {
          title: 'source package',
          key: 'allPackage',
          minWidth: 150,
        },
        {
          title: 'version',
          key: 'version',
          minWidth: 150,
        },
        {
          title: 'test result',
          slot: 'testResult',
          minWidth: 600,
        },
        {
          title1: 'test date',
          title2: 'test duration',
          renderHeader: this.renderDetailCol,
          slot: 'time',
          minWidth: 150,
        },
        {
          title1: '1st build log',
          title2: '2nd build log',
          renderHeader: this.renderDetailCol,
          slot: 'log',
          minWidth: 150,
        },
      ],
      detailTableData: [],
      detailLoading: false,
      detailTitle: '',
      mainLoading: false,
      stringList: [], // mainTable接口获取的参数，用于调用detailTable
      detailTableTotal: 0,
      detailTablePageNum: 1,
      detailTablePageSize: 10,
    };
  },
  methods: {
    ...mapMutations(['changeUrlParamVx']),
    renderMainCol(h, params) {
      let that = this;
      return h(
        'div',
        {
          style: {
            cursor: 'pointer',
            color: '#07b',
          },
          class: ['colHover'],
          on: {
            click() {
              that.$router.push({
                name: 'detail',
                query: {
                  term1: params.column.title,
                  // type: that.$route.query.type
                  //   ? that.$route.query.type
                  //   : 'openEuler',
                  type: that.$route.query.type ? that.$route.query.type : 'obs',
                },
              });
            },
          },
        },
        params.column.title
      );
    },
    renderDetailCol(h, params) {
      return h('div', [
        h('div', params.column.title1),
        h('div', params.column.title2),
      ]);
    },
    // 点击右上角菜单
    clickMenu(item) {
      this.currentMenu = item;
    },
    // 点击总表数据
    clickMainData(row, col) {
      if (col) {
        this.$router.push({
          name: 'detail',
          query: {
            term1: col,
            term2: row.categoryLevel,
            // type: this.$route.query.type ? this.$route.query.type : 'openEuler',
            type: this.$route.query.type ? this.$route.query.type : 'obs',
          },
        });
      } else {
        this.$router.push({
          name: 'detail',
          query: {
            term2: row.categoryLevel,
            // type: this.$route.query.type ? this.$route.query.type : 'openEuler',
            type: this.$route.query.type ? this.$route.query.type : 'obs',
          },
        });
      }
    },
    getMainTableData() {
      this.mainLoading = true;
      this.$axios
        .post(`${this.urlParam}/statisticalResult`, {
          architectures: this.architecture,
          testSuites: this.testedSuite,
        })
        .then((res) => {
          this.mainTableData = [];
          this.mainLoading = false;
          this.stringList = res[0]?.listSum;

          res.forEach((v) => {
            this.mainTableData.push({
              categoryLevel: v.categoryLevel,
              allPackage: v.allPackage,
              reproducible: v.reproducible,
              unreproducible: v.unreproducible,
              failingToBuild: v.failingToBuild,
              inDepwaitState: v.inDepwaitState,
              downloadProblems: v.downloadProblems,
              blacklisted: v.blacklisted,
              unknownState: v.unknownState,
            });
          });

          this.detailTablePageNum = 1;
          this.getDetailTableData({
            architectures: this.architecture,
            testSuites: this.testedSuite,
            term1: this.$route.query.term1,
            term2: this.$route.query.term2,
            stringList: this.stringList,
            pageNum: 1,
            pageSize: this.detailTablePageSize,
          });
        })
        .catch(() => {
          console.log('statisticalResult接口调用失败');
          this.mainLoading = false;
        });
    },
    setDetailTitle(data, number) {
      let temp = '';
      switch (data?.term1) {
        case 'reproducible':
          temp = 'reproducible state';
          break;
        case 'unreproducible':
          temp = 'FTBR state';
          break;
        case 'failing to build':
          temp = 'FTBFS state';
          break;
        case 'in depwait state':
          temp = 'DEPWAIT state';
          break;
        case 'download problems':
          temp = '404 state';
          break;
        case 'blacklisted':
          temp = 'blacklisted state';
          break;
        case 'unknown state':
          temp = 'UNKNOWN state';
          break;
      }
      if (data.term1 && data.term2) {
        this.detailTitle = `${number} packages in ${data.term2} in ${temp} `;
      } else if (data.term2 && !data.term1) {
        this.detailTitle = `${number} packages in categoryLevel ${data.term2}`;
      } else if (data.term1 && !data.term2) {
        this.detailTitle = `${number} packages in ${temp}`;
      } else {
        this.detailTitle = `${number} packages in source package`;
      }
    },
    getDetailTableData(
      data = {
        term1: '',
        term2: '',
        architectures: this.architecture,
        testSuites: this.testedSuite,
        stringList: this.stringList,
        pageNum: this.detailTablePageNum,
        pageSize: this.detailTablePageSize,
      }
    ) {
      this.detailLoading = true;
      this.$axios
        .post(`${this.urlParam}/select`, data)
        .then((res) => {
          this.detailTableData = [];
          this.detailLoading = false;
          this.setDetailTitle(data, res.total);
          this.detailTableTotal = res.total;
          res.data.forEach((v) => {
            this.detailTableData.push({
              tableId: v.tableId,
              categoryLevel: v.categoryLevel,
              allPackage: v.allPackage,
              version: v.version,
              testResult: v.testResult,
              testDate: v.testDate,
              testDuration: v.testDuration,
              firstBuildLog: v.firstBuildLog,
              firstLogSize: v.firstLogSize,
              secondBuildLog: v.secondBuildLog,
              secondLogSize: v.secondLogSize,
              testStatus: v.testStatus,
            });
          });
        })
        .catch(() => {
          this.detailLoading = false;
          console.log('select接口调用失败');
        });
    },
    changeDetailTablePage(page) {
      this.detailTablePageNum = page;
      this.getDetailTableData({
        architectures: this.architecture,
        testSuites: this.testedSuite,
        term1: this.$route.query.term1,
        term2: this.$route.query.term2,
        stringList: this.stringList,
        pageNum: this.detailTablePageNum,
        pageSize: this.detailTablePageSize,
      });
    },
    changeDetailTableSize(pageSize) {
      this.detailTablePageSize = pageSize;
      this.detailTablePageNum = 1;
      this.getDetailTableData({
        architectures: this.architecture,
        testSuites: this.testedSuite,
        term1: this.$route.query.term1,
        term2: this.$route.query.term2,
        stringList: this.stringList,
        pageNum: this.detailTablePageNum,
        pageSize: this.detailTablePageSize,
      });
    },
    clickTestResult(row, type, resultIndex) {
      this.$router.push({
        path: `/testResult/${row.tableId}/${type}/${resultIndex}`,
        query: {
          // type: this.$route.query.type ? this.$route.query.type : 'openEuler',
          type: this.$route.query.type ? this.$route.query.type : 'obs',
        },
      });
    },
    getStatus(str) {
      if (str.indexOf('unreproducible') > -1) {
        return 'unreproducible';
      } else if (str.indexOf('reproducible') > -1) {
        return 'reproducible';
      }
    },
    getImgSrc(result) {
      if (result.indexOf('unreproducible') > -1) {
        return require('@/assets/weather-showers-scattered.png');
      } else if (result.indexOf('reproducible') > -1) {
        return require('@/assets/weather-clear.png');
      } else if (
        result.indexOf('failing to build') > -1 ||
        result.indexOf('failed to build') > -1
      ) {
        return require('@/assets/weather-storm.png');
      }
    },
  },
  computed: {
    ...mapState(['testedSuite', 'architecture', 'urlParam']),
    homeTested() {
      let obj = {
        testedSuite: this.testedSuite,
        architecture: this.architecture,
      };
      return obj;
    },
  },
  watch: {
    $route() {
      this.detailTablePageNum = 1;
      this.getDetailTableData({
        architectures: this.architecture,
        testSuites: this.testedSuite,
        term1: this.$route.query.term1,
        term2: this.$route.query.term2,
        stringList: this.stringList,
        pageNum: 1,
        pageSize: this.detailTablePageSize,
      });
    },
    homeTested() {
      this.getMainTableData();
    },
  },
  mounted() {
    if (this.$route.query.type) {
      this.changeUrlParamVx({ urlParam: this.$route.query.type });
    }

    if (this.testedSuite) {
      this.getMainTableData();
    }
  },
};
</script>

<style lang="less" scoped>
.main {
  padding: 30px 0px;
  margin: 0 auto;
  text-align: left;
  width: 95%;
  min-width: 650px;
  font-size: 0.9em;

  .topWrap {
    display: flex;
    justify-content: space-between;
    .topTitle {
      .text {
        font-weight: bold;
        font-size: 24px;
        margin-left: 10px;
      }
    }

    .topButton {
      display: flex;

      .longBtn {
        width: 196px;
        height: 40px;
        background: #ffffff;
        border: 1px solid #dcdcdc;
        font-size: 16px;
        font-family: PingFang SC;
        font-weight: 500;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        span {
          margin-left: 5px;
        }
      }

      .active {
        background: #1aa7e8;
        color: #ffffff;
      }
    }
  }

  .mainTable {
    margin-top: 30px;

    .mainTableData {
      color: #07b;
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }

    /deep/.ivu-spin-dot {
      width: 100px;
      height: 100px;
    }
  }

  .detailTitle {
    margin-top: 50px;
    font-size: 20px;
    font-family: PingFang SC;
    font-weight: bold;
    color: #000000;
  }

  .detailTable {
    margin-top: 10px;

    /deep/.ivu-spin-dot {
      width: 100px;
      height: 100px;
    }

    /deep/.ivu-spin-main {
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .testResultImg {
      vertical-align: middle;
    }

    .paginationWrap {
      margin: 10px;
      display: flex;
      justify-content: end;
    }
  }

  /deep/.colHover {
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
