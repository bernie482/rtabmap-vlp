#include <iostream>
using namespace std;
#define ARRAY_SIZE 5  //�x�}�����Ƥj�p 
int getValue(int ,int);
int A[ARRAY_SIZE][ARRAY_SIZE]={ //�W�T���x�}�����e 
       {8, 0, 0,  0,  0},
       {19, 32, 0, 0, 0}, 
       {24, 23, 7, 0, 0},
       {6, 5, 14, 17, 0}, 
       {7, 8, 12, 21, 9}};  
//�@���}�C���}�C�ŧi 
int B[ARRAY_SIZE*(1+ARRAY_SIZE)/2];  
int main()
{
    int i=0,j=0;
    int index;    
		cout<<"=========================================="<<endl;
		cout<<"�U�T���ίx�}�G"<<endl;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
		        cout<<"\t"<<A[i][j];
		    cout<<endl;    
		}
		//�N���U�T���x�}���Y���@���}�C 
		index=0;
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j < ARRAY_SIZE ; j++ ) 
			{
                if(A[i][j]!=0) B[index++]=A[i][j];
            }
        }
		cout<<"=========================================="<<endl;
		cout<<"�H�@�����覡��ܡG"<<endl;
		cout<<"\t[";
		for ( i = 0 ; i < ARRAY_SIZE ; i++ ) 
		{
			for ( j = 0 ; j <= i ; j++ ) 
		        cout<<" "<<getValue(i,j);
		}
		cout<<" ]";
		cout<<endl;    
}
int getValue(int i, int j) {
        int index = i*(i+1)/2 + j;
        return B[index];
}
