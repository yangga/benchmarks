# 연관 단어 벤치마킹

1. prev-next 단어간 연관성을 만듦
2. 호출이 될 때 마다 연관성(weight) 증가
3. 타겟 단어의 연관 단어를 추출

## 데이터
```
x1000 times
[gremlin]
#elapsedTime - initDB 2.244
#elapsedTime - searching 3.932

[mysql]
#elapsedTime - initDB 1.339
#elapsedTime - searching 2.186

x10000 times
[gremlin]
#elapsedTime - initDB 27.365
#elapsedTime - searching 48.379

[mysql]
#elapsedTime - initDB 13.007
#elapsedTime - searching 20.943
```

## 결과
* 1(one) depth의 심플한 테스트 결과, mysql이 훨씬 빠름
* depth가 더 깊으면 join 액션이 많이 필요하기 때문에 결과가 달라질 수도 있을 듯

# 준비물
* gremlin server - https://github.com/designfrontier/gremlin-local
* mysql server
