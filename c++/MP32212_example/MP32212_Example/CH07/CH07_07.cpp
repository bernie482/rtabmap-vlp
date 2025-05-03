// Prim 演算法又稱 P 氏法 
#define  BIG_NO 99999
#include <iostream>
using namespace std;

int data[60][60];  //宣告二維陣列的相鄰矩陣
int total=0;    //記錄最小成本擴張樹的總和, 初值設定為 0 
int start;           //最小成本擴張樹的起點
int value[60];       //以一維陣列邊的大小的權值
char marked[60]={0}; //用來標記該頂點是否已找到, 初值設定為 0
int road[60];        //記錄最小成本擴張樹的路徑
void MinSpanTree(int,int,int); //最小生成樹的副程式 

int main(void){
	int node=3;    //圖形頂點總數
    int edge=3;   //圖形總邊數
	int x,y,z;
	//data陣列初始值設定 
	for(int i=0;i<node;i++){
		for(int j=0;j<node;j++){
			data[i][j]=BIG_NO; 
		}
	}
	cout<<"圖形頂點個數= "<<node<<endl; //輸出圖形頂點的總數 
	cout<<"圖形總邊數= "<<edge<<endl;  //輸出圖形總邊數
	//讀取及輸出各邊的資訊, 包括起點, 終點及邊長
    for(int i=0;i<edge;i++){  
        cout<<"請輸入第 "<<(i+1)<<" 個邊的起點, 終點及邊長, 數值之間以空白隔開 "<<endl;
 	    cin>>x>>y>>z;
	    data[x][y]=z; 
	    data[y][x]=z;
	    cout<<"第 "<<(i+1)<<" 個邊是從頂點 "<<x<<" 到頂點 "<<y<<", 其邊界長= "<<z<<endl;
	 }

	cout<<"請輸入最小成本擴張樹起始頂點: ";
	cin>>start;
	MinSpanTree(start,node,edge);	//呼叫 Prim演算法副程式 
	cout<<"最小成本擴張樹的路徑為："<<endl;
	for(int i=0;i<node;i++){
		if(i!=start){
		    cout<<"連結頂點 "<<road[i]<<"------到頂點 "<<i<<" 的邊"<<endl;
		}
	}
	cout<<"最小成本擴張樹的總成本= "<<total<<endl;	
	return 0;
} 

void MinSpanTree(int start,int node, int edge){
	int smallest;      //用來記錄成本最小的變數 
	int end_point;     //成本最小的邊的對應頂點 
	marked[start]=1;   //標記該頂點為已找到 
	
	//此迴圈是進行初始化工作 
	for(int i=0;i<node;i++){   
		value[i]=data[start][i];   //初始化開始頂點的各鄰接邊的成本
		road[i]=start; //初始化從開始頂點到 i 頂點的路徑
	} 
	
	for(int i=1;i<node;i++){
		smallest=BIG_NO;	
		//以迴圈逐一尋找出找出成本最小 
		for(int j=0;j<node;j++){   
			if((marked[j]==0) && (smallest>value[j])){
				smallest=value[j]; //記錄成本最小邊的數值 
				end_point=j;     //記錄最小邊的對應邊的頂點 j 
			}
		}
		total =total+value[end_point];   //累加最小成本的值
		marked[end_point]=1;  //標記找出的頂點  
		for(int j=0;j<node;j++){  //更新記錄邊的大小的權值 value 陣列
			if((marked[j]==0) && (data[end_point][j]<value[j])){
				value[j]=data[end_point][j];
				road[j]=end_point;
			}
		} 
	}
} 

