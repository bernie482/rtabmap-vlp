#include <iostream>
#include <cstdlib> 
using namespace std;

int add(int, int);
int main(void){
	int a = 5, b = 3, sum;
	sum = add(a, b);
	cout <<  a << "+" << b << "=" << sum << endl;
		
	system("pause");
	return 0 ;
}
int add(int a, int b){
	int sum;
	sum = a + b;
	return sum;
}
