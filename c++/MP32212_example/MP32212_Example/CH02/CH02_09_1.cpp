#include <iostream>
using namespace std;
#define ARRAY_SIZE 5  //矩陣的維數大小 
int getValue(int ,int);
int A[ARRAY_SIZE][ARRAY_SIZE]={ //上三角矩陣的內容 
       {1, 2, 0, 0, 0}, 
       {3, 4, 5, 0, 0}, 
       {0, 6, 7, 8, 0}, 
       {0, 0, 9, 10, 11}, 
       {0, 0, 0, 12, 13}};  
//一維陣列的陣列宣告 
int B[ARRAY_SIZE*(1+ARRAY_SIZE)/2];
int k = 1;   
int main()
{
    int i=0,j=0;
    int index;    
		cout<<"=========================================="<<endl;
		cout<<"帶狀矩陣："<<endl;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
		        cout<<"\t"<<A[i][j];
		    cout<<endl;    
		}
		//將右上三角矩陣壓縮為一維陣列 
		index=1;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
			{
                if(A[i][j]!=0) B[index++]=A[i][j];
            }
        }
		cout<<"=========================================="<<endl;
		cout<<"以一維的方式表示："<<endl;
		cout<<"\t[";
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ){ 
                if(abs(i-j) <= k)
		        cout<<" "<<getValue(i,j);
            }
		}
		cout<<" ]";
		cout<<endl;    
}
int getValue(int i, int j) {
        int index = (2*k+1)*i + (j - i + k);
        return B[index];
}
