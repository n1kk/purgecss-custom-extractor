const expect = require('chai').expect
const sinon = require('sinon')
const Extractor = require('./index')

const textA = `
<template>
  <div id="app">
    <img src="./assets/logo.png" class="border w-1/2 custom_one">
    <!--<img src="./assets/logo.png" class="border w-1/3">-->
    <!--<img src="./assets/logo.png" class="border w-1/4">-->
    <router-view/>
  </div>
</template>
`
const case2 = {
  text: '<a><img src="#"><br/></a>',
  re1: /<.*?>/g,
  re2: /<.*?>/,
  re3: '<.*?>',
  re4: '/<.*?>/g',
  res1: ['<a>','<img src="#">','<br/>','</a>'],
}

describe('# Extractor', function() {
  let matchProcessorCheckCase2 = (callback, res = case2.res1) => {
    let n = 0
    res.forEach(el => {
      let call = callback.getCall(n++)
      expect(call.args.length).to.be.equal(1)
      expect(call.args[0]).to.be.instanceOf(Array)
      expect(call.args[0][0]).to.be.equal(el)
      expect(call.returned(el)).to.be.true
    })
  }
  
  describe('matchAll()', function () {
    
    it('should return all matches', function () {
      expect(Extractor.matchAll(case2.re1, case2.text)).to.deep.equal(case2.res1)
    });
    
    it('should work with regex', function () {
      expect(Extractor.matchAll(case2.re2, case2.text)).to.deep.equal(case2.res1)
    });
    
    it('should work with without `g` flag', function () {
      expect(Extractor.matchAll(case2.re2, case2.text)).to.deep.equal(case2.res1)
    });
    
    it('should work with string regex', function () {
      expect(Extractor.matchAll(case2.re3, case2.text)).to.deep.equal(case2.res1)
    });
    
    it('should work with string regex woth flags', function () {
      expect(Extractor.matchAll(case2.re4, case2.text)).to.deep.equal(case2.res1)
    });
    
    it('should call a function on each match', function () {
      let callback = sinon.spy((m) => m[0]);
      let all = Extractor.matchAll(case2.re4, case2.text, callback)
      matchProcessorCheckCase2(callback)
    });
    
  });
  
  
  describe('custom()', function () {
  
    it('should work with regex', function () {
      let e = Extractor.custom({regex:case2.re1})
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1)
    });
    it('should work with regex as first arg', function () {
      let e = Extractor.custom(case2.re1)
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1)
    });
  
    it('should work with regex and processor', function () {
      let callback = sinon.spy((m) => m[0]);
      let e = Extractor.custom({regex:[case2.re1, callback]})
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1)
      matchProcessorCheckCase2(callback)
    });
    it('should work with regex and processor as first arg', function () {
      let callback = sinon.spy((m) => m[0]);
      let e = Extractor.custom([case2.re1, callback])
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1)
      matchProcessorCheckCase2(callback)
    });
  
    it('should work with list of regex', function () {
      let callback = sinon.spy((m) => m[0]);
      let callback2 = sinon.spy((m) => m[0]);
      let e = Extractor.custom({regex: [
          [case2.re1, callback],
          [case2.re2, callback2],
      ]})
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1.concat(case2.res1))
      matchProcessorCheckCase2(callback)
      matchProcessorCheckCase2(callback2)
    });
    it('should work with list of regex and processors as first arg', function () {
      let callback = sinon.spy((m) => m[0]);
      let callback2 = sinon.spy((m) => m[0]);
      let e = Extractor.custom([
        [case2.re1, callback],
        [case2.re2, callback2],
      ])
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1.concat(case2.res1))
      matchProcessorCheckCase2(callback)
      matchProcessorCheckCase2(callback2)
    });
  
    it('should work with mix of regex and processors', function () {
      let callback = sinon.spy((m) => m[0]);
      let e = Extractor.custom({regex: [
          [case2.re1, callback],
          [case2.re2],
          case2.re3
        ],
      })
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1.concat(case2.res1).concat(case2.res1))
    });
  
    it('should invoke matchProcessor', function () {
      let callback = sinon.spy((m) => m);
      let e = Extractor.custom({
        regex: [
          [case2.re1, sinon.spy((m) => m[0])],
          [case2.re2, sinon.spy((m) => m[0])],
          case2.re3,
        ],
        matchProcessor: callback
      })
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1.concat(case2.res1).concat(case2.res1))
      let n = 0
      res.forEach(el => {
        let call = callback.getCall(n++)
        expect(call.args.length).to.be.equal(3)
        expect(call.args[0]).to.be.equal(el)
        expect(call.returned(el)).to.be.true
      })
    });
  
    it('should invoke contentProcessor', function () {
      let callback = sinon.spy((c) => c);
      let e = Extractor.custom({
        regex: case2.re3,
        contentProcessor: callback
      })
      let res = e.extract(case2.text)
      expect(callback.called).to.be.true
      expect(callback.calledWith(case2.text)).to.be.true
    });
  
    it('should use value from contentProcessor', function () {
      let callback = sinon.spy((c) => c + '<img>');
      let e = Extractor.custom({
        regex: case2.re3,
        contentProcessor: callback
      })
      let res = e.extract(case2.text)
      expect(res).to.deep.equal(case2.res1.concat(['<img>']))
    });
  
  });
});
